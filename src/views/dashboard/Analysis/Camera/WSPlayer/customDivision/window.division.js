/**
 * 自定义窗口分割组件：
 * VERSION: 1.0.0
 * 描述：主要针对有窗口分割需求的地方，实现自定义的窗口分割。
 * 入口方法： initWindowDivision 传入 division 【分割规则，传入JSON字符串】 windowId【当前窗口的唯一标识id】 callback【回调函数对象，共有三个，onError, onConfirm, onCancel】
 */
const DEFAULT_STEP = 100 // 表示默认的播放器能切割的宽/高度
const DEFAULT_DISTANCE = 100 / DEFAULT_STEP // 默认值
const MAX_WINDOW = 20 // 设置最大窗口数量为 20
let division_callback = {} // 设置回调 
let $parentDom, // 外部的dom结点
    $container, // 内部最外层结点
    default_division = true, // 是否为默认分割
    dragType = "",// 拖拽类型 (左右/上下拖拽)
    initMousePosition = { // 鼠标移动的数据
        x: 0,
        y: 0
    },
    selectInfo = {}, // 选中的窗口的item结点
    divisionArr = [], // 自定义分割的总数
    temp_move_data = {}, // 每次移动时存储的需要移动的窗口数据
    lineInfo = {}, // 每次移动的线条的数据
    move_step = 0, // 移动过程中的步值
    lineDom = '' // 移动切割的线段DOM

let disableSelect = () => {
    try {
        document.querySelector($parentDom).onselectstart = function () {
            return false
        }
    } catch {
        setTimeout(() => {
            disableSelect()
        }, 200)
    }
}

disableSelect()
    
// 默认分割
function defaultDivision(maxNum = 4) {
    default_division = true
    let list = []
    let percent = 100 / Math.sqrt(maxNum)
    for(var i = 0; i < maxNum; i++) {
        list.push({
            selectIndex: i,
            width: percent,
            height: percent,
        })
    }

    var doms = list.map(item => {
        return getItemDiv(item)
    })

    $container.innerHTML = doms.join('')
}

/**
 * 监听所有的移动事件，做不同的业务逻辑
 */
document.addEventListener('mousemove', (e) => {
    if(!dragType) {
        return
    }
    let rect = $container.getBoundingClientRect()
    let domX = rect.width / DEFAULT_STEP,
        domY = rect.height / DEFAULT_STEP
    switch(dragType) {
        case "right-border":
            initMousePosition.x += e.movementX
            // 步数发生改变时，则切换步数，并改变回显的线段
            if (move_step !== Math.round(initMousePosition.x / domX)) {
                move_step = Math.round(initMousePosition.x / domX)
                if(lineInfo.lStep + move_step <= 0) {
                    move_step = 1 - lineInfo.lStep
                    return
                }
                if(lineInfo.lStep + move_step >= DEFAULT_STEP) {
                    move_step = DEFAULT_STEP - lineInfo.lStep - 1
                    return
                }
                document.querySelector("#division-move-line").style.left = `${(lineInfo.lStep + move_step) * DEFAULT_DISTANCE}%`
            }
            break;
        case "bottom-border":
            initMousePosition.y += e.movementY
            // 步数发生改变时，则切换步数，并改变回显的线段
            if (move_step !== Math.round(initMousePosition.y / domY)) {
                move_step = Math.round(initMousePosition.y / domY)
                if(lineInfo.tStep + move_step <= 0) {
                    move_step = 1 - lineInfo.tStep
                    return
                }
                if(lineInfo.tStep + move_step >= DEFAULT_STEP) {
                    move_step = DEFAULT_STEP - lineInfo.tStep - 1
                }
                document.querySelector("#division-move-line").style.top = `${(lineInfo.tStep + move_step) * DEFAULT_DISTANCE}%`
            }
            break;
        default:
            break;
    }
})

/**
 * 监听所有的鼠标松开事件，做不同的业务逻辑
 */
document.addEventListener('mouseup', (e) => {
    if(dragType) {
        let mergeSeque = [],
        canMove = true
        switch(dragType) {
            case "right-border":
                if(!move_step) {
                    return;
                }

                let { l_window, r_window } = temp_move_data

                // 合并左右两侧处理后的数组
                mergeSeque = [...l_window.map(item => {
                    item.wStep -= move_step,
                    item.lStep += move_step
                    if(item.wStep < 1) {
                        canMove = false
                    }
                    return item
                }), ...r_window.map(item => {
                    item.wStep += move_step
                    if(item.wStep < 1) {
                        canMove = false
                    }
                    return item
                })]

                if(!canMove) {
                    dragType = ""
                    document.querySelector('#division-move-line').remove()
                    renderWindow()
                    division_callback.onError("不能拖拽到当前位置，请重新拖拽")
                    return
                }
                 // 改变整体布局
                mergeSeque.forEach(item => divisionArr[item.selectIndex] = item)
                break;
            case "bottom-border":
                if(!move_step) return;

                let {t_window, b_window} = temp_move_data
                // 合并左右两侧处理后的数组
               
                mergeSeque = [...t_window.map(item => {
                    item.hStep -= move_step,
                    item.tStep += move_step
                    if(item.hStep < 1) {
                        canMove = false
                    }
                    return item
                }), ...b_window.map(item => {
                    item.hStep += move_step
                    if(item.hStep < 1) {
                        canMove = false
                    }
                    return item
                })]
                if(!canMove) {
                    dragType = ""
                    document.querySelector('#division-move-line').remove()
                    renderWindow()
                    division_callback.onError("不能拖拽到当前位置，请重新拖拽")
                    return
                }
                 // 改变整体布局
                mergeSeque.forEach(item => divisionArr[item.selectIndex] = item)
                break;
            default:
                break;
        }
        dragType = ""
        selectInfo = {}
        renderWindow()
    }
})

// 左右拖拽时要改边的窗口信息
function getDragDataX ({ wStep, lStep, selectIndex }, divisionArrCopy) {
    let r_window = divisionArrCopy.filter(item => item.lStep + item.wStep === lStep + wStep).sort((a, b) => a.tStep - b.tStep)
    let l_window = divisionArrCopy.filter(item => item.lStep === lStep + wStep).sort((a, b) => a.tStep - b.tStep)
    for(var i = 0; i < r_window.length - 1; i++) {
        // 表示如果此处出现断层，且当前数据里没有值，则前面数据全部删除
        if(r_window[i].tStep + r_window[i].hStep !== r_window[i + 1].tStep) {
            if(selectIndex <= r_window[i].selectIndex) {
                r_window.splice(i + 1)
            } else {
                r_window.splice(0, i)
                i = -1;
            }
        }
    }
    let maxTIndex = -1
    let maxBIndex = -1
    l_window.forEach((lItem) => {
        let rtIndex = r_window.findIndex(rItem => lItem.tStep === rItem.tStep)
        let rbIndex = r_window.findLastIndex(rItem => lItem.tStep + lItem.hStep === rItem.tStep + rItem.hStep)
        rtIndex > -1 && (rtIndex === 0 ? (maxTIndex = 0) : (maxTIndex = Math.min(rtIndex, maxTIndex)))
        rbIndex > -1 && (maxBIndex = Math.max(rbIndex, maxBIndex))
    })
    // 右侧列表的值对了
    l_window = l_window.filter(item => {
        return item.tStep >= r_window[maxTIndex].tStep && (item.tStep + item.hStep) <= r_window[maxBIndex].tStep + r_window[maxBIndex].hStep
    })
    return {
        l_window,
        r_window
    }
}


// 上下拖拽时要改边的窗口信息
function getDragDataY ({ hStep, tStep, selectIndex }, divisionArrCopy) {
    let b_window = divisionArrCopy.filter(item => item.tStep + item.hStep === tStep + hStep).sort((a, b) => a.lStep - b.lStep)
    let t_window = divisionArrCopy.filter(item => item.tStep === tStep + hStep).sort((a, b) => a.lStep - b.lStep)
    for(var i = 0; i < b_window.length - 1; i++) {
        // 表示如果此处出现断层，且当前数据里没有值，则前面数据全部删除
        if(b_window[i].lStep + b_window[i].wStep !== b_window[i + 1].lStep) {
            if(selectIndex <= b_window[i].selectIndex) {
                b_window.splice(i + 1)
            } else {
                b_window.splice(0, i)
                i = -1;
            }
        }
    }
    let maxLIndex = -1
    let maxRIndex = -1
    t_window.forEach((tItem) => {
        let blIndex = b_window.findIndex(bItem => tItem.lStep === bItem.lStep)
        let brIndex = b_window.findLastIndex(bItem => tItem.lStep + tItem.wStep === bItem.lStep + bItem.wStep)
        blIndex > -1 && (blIndex === 0 ? (maxLIndex = 0) : (maxLIndex = Math.min(blIndex, maxLIndex)))
        brIndex > -1 && (maxRIndex = Math.max(brIndex, maxRIndex))
    })
    // 左边列表的值对了
    t_window = t_window.filter(item => {
        return item.lStep >= b_window[maxLIndex].lStep && (item.lStep + item.wStep) <= b_window[maxRIndex].lStep + b_window[maxRIndex].wStep
    })

    return {
        t_window,
        b_window
    }
}

// 排序的窗口数量 (核心)
function sortWindow(arr = []) {
    if(!arr.length || arr.length === 1) {
        divisionArr = [
            {
                wStep: DEFAULT_STEP,
                hStep: DEFAULT_STEP,
                tStep: 0,
                lStep: 0,
                selectIndex: 0
            }
        ]
        return divisionArr
    }
    arr = arr.sort((a, b) => a.tStep - b.tStep)
    for(let i = 0; i < arr.length - 1; i++) {
        if(arr[i].tStep === arr[i+1].tStep && arr[i].lStep > arr[ i + 1 ].lStep) {
            let obj = {...arr[i]}
            arr[i] = {...arr[i + 1]}
            arr[i + 1] = obj
        }
    }
    return arr.map((item, index) => {
        item.selectIndex = index
        return item
    })
    
}

// 分割窗口
function divisionWindow(info) {
    if(divisionArr.length === MAX_WINDOW) {
        division_callback.onError(`自定义播放器只支持最大分割${MAX_WINDOW}个窗口`)
        return;
    }
    if(info.wStep === 1 && info.hStep === 1) return
    // 宽度 >= 高度，则竖着切
    if(info.wStep >= info.hStep) {
        // 先加上新的
        divisionArr.push({
            ...info,
            lStep: info.lStep + Math.floor(info.wStep / 2),
            wStep: Math.ceil(info.wStep / 2),
        })
        // 再处理原来的
        divisionArr[info.selectIndex] = {
            ...info,
            wStep: Math.floor(info.wStep / 2)
        }
    } else {
        divisionArr.push({
            ...info,
            tStep: info.tStep + Math.floor(info.hStep / 2),
            hStep: Math.ceil(info.hStep / 2),
        })
        // 再处理原来的
        divisionArr[info.selectIndex] = {
            ...info,
            hStep: Math.floor(info.hStep / 2)
        }
    }
    renderWindow()
}

// 每次取消切割
function deleteDivisionWindow(info) {
    // 一块屏不能取消切割
    // 注意：取消分割时，按照 向上合并， 向左合并，向右合并，向下合并 的规则进行
    if(divisionArr.length === 1) return
    let selectIndex = divisionArr.findIndex(item => {
        return (
            item.wStep === info.wStep
            && item.lStep === info.lStep
            && (item.tStep + item.hStep === info.tStep || info.tStep + info.hStep === item.tStep)
        ) || (
            item.hStep === info.hStep
            && item.tStep === info.tStep
            && (item.lStep + item.wStep === info.lStep || info.lStep + info.wStep === item.lStep)
        )
    })
    if(selectIndex > -1) {
        let item = divisionArr[selectIndex]
        if(item.tStep === info.tStep) {
            if(item.selectIndex > info.selectIndex) {
                divisionArr[info.selectIndex].wStep = info.wStep + item.wStep
                divisionArr.splice(item.selectIndex, 1)
            } else {
                divisionArr[item.selectIndex].wStep = item.wStep + info.wStep
                divisionArr.splice(info.selectIndex, 1)
            }
        }
        if(item.lStep === info.lStep) {
            if (item.selectIndex > info.selectIndex) {
                divisionArr[info.selectIndex].hStep = info.hStep + item.hStep
                divisionArr.splice(item.selectIndex, 1)
            } else {
                divisionArr[item.selectIndex].hStep = item.hStep + info.hStep
                divisionArr.splice(info.selectIndex, 1)
            }
        }
    }
    renderWindow()
}


/**
 * 获取移动的线条
 */
function getMoveLine(info, moveType) {
    let line = ""
    // 表示左右移动
    if(moveType === 'x') {
        line = `<div id="division-move-line" style="position: absolute; background: #1d79f4; top: ${info.tStep * DEFAULT_DISTANCE}%; left: ${info.lStep * DEFAULT_DISTANCE}%; width: 2px; height: ${info.hStep * DEFAULT_DISTANCE}%; "></div>`
    }
    if(moveType === 'y') {
        line = `<div id="division-move-line" style="position: absolute; background: #1d79f4; top: ${info.tStep * DEFAULT_DISTANCE}%; left: ${info.lStep * DEFAULT_DISTANCE}%; width: ${info.wStep * DEFAULT_DISTANCE}%; height: 2px; "></div>`
    }
    return line
}

/**
 * 获取每一个窗口的dom
 * @param {*} info 
 * @returns 
 */
 function getItemDiv(info) {
    return `<div
        id="dom-item-${info.selectIndex}"
        class="${default_division ? 'dom-item-flex' : 'dom-item'}"
        style="top: ${info.top}%; left: ${info.left}%; width: ${info.width}%; height: ${info.height}%;"
    >
        <div class="point-n-resize" id="dom-item-${info.selectIndex}-bottom-border" style="bottom: -4px; left: 0; width: 100%; height: 6px;"></div>
        <div class="point-e-resize" id="dom-item-${info.selectIndex}-right-border" style="top: 0; right: -4px; width: 6px; height: 100%;"></div>
        <div id="dom-item-${info.selectIndex}-btn" class="dom-item-split-btn"></div>
        <div id="dom-item-${info.selectIndex}-delete-btn" class="dom-item-merge-btn"></div>
    </div>`
}


/**
 * 这是大盒子
 * @returns 
 */
function getDiv(windowId) {
    return `<div id="${windowId}-container" style="width: 100%; height: 100%; border: 1px solid #aaa; position: relative;"></div>
        <div class="window-division-bottom-container">
            <button class="window-division-btn window-division-btn-primary" id="${windowId}-confirm-btn">确认</button>
            <button class="window-division-btn window-division-btn-info" id="${windowId}-cancel-btn">取消</button>
        </div>
    `
}

/**
 * 自定义布局
 * @param {Array} list 表示按照相对应的数组对象进行数据渲染
 */
 function customDivision(list = []) {
    default_division = false
    let doms = []
    list.forEach(item => {
        doms.push(getItemDiv({
            selectIndex: item.selectIndex,
            width: item.wStep * DEFAULT_DISTANCE,
            height: item.hStep * DEFAULT_DISTANCE,
            top: item.tStep * DEFAULT_DISTANCE,
            left: item.lStep * DEFAULT_DISTANCE
        }))
    })
    $container.innerHTML = doms.join('')
    
    list.forEach(item => {
        document.querySelector(`#dom-item-${item.selectIndex}-btn`).addEventListener('click', () => {
            divisionWindow(item)
        })
        document.querySelector(`#dom-item-${item.selectIndex}-delete-btn`).addEventListener('click', () => {
            deleteDivisionWindow(item)
        })

        document.querySelector(`#dom-item-${item.selectIndex}-right-border`).addEventListener('mousedown', (e) => {
            // 如果是两边则阻止执行
            if(item.lStep + item.wStep === DEFAULT_STEP) return
            selectInfo = item
            dragType = "right-border"
            initMousePosition = {
                x: 0,
            }
            move_step = 0
            temp_move_data = getDragDataX({ ...item }, JSON.parse(JSON.stringify(divisionArr)))
            lineInfo = {
                hStep: temp_move_data.r_window.reduce((total, item) => total + item.hStep, 0),
                tStep: temp_move_data.r_window[0].tStep,
                lStep: temp_move_data.l_window[0].lStep
            }
            lineDom = getMoveLine(lineInfo, 'x')
            $container.innerHTML += lineDom;

        })
        document.querySelector(`#dom-item-${item.selectIndex}-bottom-border`).addEventListener('mousedown', (e) => {
            // 如果是两边则阻止执行
            if(item.tStep + item.hStep === DEFAULT_STEP) return
            selectInfo = item
            dragType = "bottom-border"
            initMousePosition = {
                y: 0,
            }
            move_step = 0
            temp_move_data = getDragDataY({ ...item }, JSON.parse(JSON.stringify(divisionArr)))
            lineInfo = {
                wStep: temp_move_data.b_window.reduce((total, item) => total + item.wStep, 0),
                lStep: temp_move_data.b_window[0].lStep,
                tStep: temp_move_data.t_window[0].tStep
            }
            lineDom = getMoveLine(lineInfo, 'y')
            $container.innerHTML += lineDom;
        })
    })
}

// 渲染窗口
function renderWindow() {
    // 清除子元素
    $container.innerHTML = ""
    divisionArr = sortWindow(divisionArr)
    // 每次分割后要排序然后渲染
    customDivision(divisionArr)
}

/**
 * 入口文件
 * @param {*} division 分割方式, 支持division
 * @param {*} callback 
 */
export const initWindowDivision = (param) => {
    let { division, windowId, callback } = param
    $parentDom = document.querySelector(`#${windowId}`)
    // 放入盒子 （后续修改为要挂载的DIV）
    $parentDom.innerHTML = getDiv(windowId, callback)
    // 容器
    $container = document.querySelector(`#${windowId}-container`);
    // 设置回调
    division_callback = callback
    // 设置确定按钮监听
    document.querySelector(`#${windowId}-confirm-btn`).addEventListener('click', () => {
        callback.onConfirm && callback.onConfirm(JSON.stringify(divisionArr))
    })
     // 设置取消按钮监听
    document.querySelector(`#${windowId}-cancel-btn`).addEventListener('click', () => {
        callback.onCancel && callback.onCancel()
    })
    if(!division) {
        customDivision(sortWindow())
        return
    }
    // 如果是默认布局，则执行默认布局方法
    if([1, 4, 9, 16, 25].includes(Number(division))) {
        defaultDivision(Number(division))
        return
    }
    if(typeof division === 'string') {
        try {
            divisionArr = sortWindow(JSON.parse(division))
            customDivision(divisionArr)
        } catch(err) {
            callback.onError && callback.onError("传入格式错误，请重新传入")
        }
        return
    }
    callback.onError && callback.onError("传入格式错误，请重新传入")   
}