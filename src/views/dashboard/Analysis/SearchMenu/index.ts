import { h, reactive, FunctionalComponent,VNode,RendererNode, RendererElement } from "vue";
import { MenuItemType, RenderFn } from "./index.d";

import deviceTotalPic from "@/assets/images/homepage/device_total_pic.png";
import fireSaturation from "@/assets/images/homepage/fire_saturation.png";
import specialCondition from "@/assets/images/homepage/special_condition.png";
import offline from "@/assets/images/homepage/offline.png";
import patrolSpot from "@/assets/images/homepage/patrol_spot.png";


export const renderPic:RenderFn = (imgUrl: string, style: string) => {
  return h("img", { src: imgUrl, class: style });
};

export const renderLabel:RenderFn = (label: string, num: string | number, style: string) => {
    return h('div', [
        h('div', num ),
        h('div', label),
        h(()=> renderPic(_, 'status' ))
    ])
}

export const items: MenuItemType[] = reactive([
  {
    key: "1",
    icon: () => renderPic(deviceTotalPic, "icon-img"),
    label: "Option 1",
    title: "Option 2",
  },
  {
    key: "2",
    icon: () => renderPic(fireSaturation, "icon-img"),
    label: "Option 2",
    title: "Option 2",
  },
  {
    key: "3",
    icon: () => renderPic(specialCondition, "icon-img"),
    label: "Option 3",
    title: "Option 3",
  },
  {
    key: "sub1",
    icon: () => renderPic(offline, "icon-img"),
    label: "Navigation One",
    title: "Navigation One",
  },
  {
    key: "sub2",
    icon: () => renderPic(patrolSpot, "icon-img"),
    label: "Navigation Two",
    title: "Navigation Two",
  },
]);
