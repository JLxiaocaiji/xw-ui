import { h, reactive, FunctionalComponent, VNode, RendererNode, RendererElement } from "vue";
import { MenuItemType, RenderFn } from "./index.d";

import deviceTotalPic from "@/assets/images/homepage/device_total_pic.png";
import fireSaturation from "@/assets/images/homepage/fire_saturation.png";
import specialCondition from "@/assets/images/homepage/special_condition.png";
import offline from "@/assets/images/homepage/offline.png";
import patrolSpot from "@/assets/images/homepage/patrol_spot.png";

import green from "@/assets/images/homepage/green.png";
import red from "@/assets/images/homepage/red.png";
import yellow from "@/assets/images/homepage/yellow.png";
import orange from "@/assets/images/homepage/orange.png";
import blue from "@/assets/images/homepage/blue.png";

export const renderPic: RenderFn = (imgUrl?: string, style?: string) => {
  return h("img", { src: imgUrl, class: style });
};

export const renderMenuLabel: RenderFn = (label?: string, num?: string | number, pic?: string) => {
  return h("div", [h("div", { class: "label-num" }, num), h("div", { class: "label-label" }, label), h(renderPic(pic, "label-pic"), 1)]);
};

export const items: MenuItemType[] = reactive([
  {
    key: "1",
    icon: () => renderPic(deviceTotalPic, "icon-img"),
    label: renderMenuLabel("当前厂区设备总数", 2997, green),
    title: "Option 2",
  },
  {
    key: "2",
    icon: () => renderPic(fireSaturation, "icon-img"),
    label: renderMenuLabel("当前厂区火警", 0, red),
    title: "Option 2",
  },
  {
    key: "3",
    icon: () => renderPic(specialCondition, "icon-img"),
    label: renderMenuLabel("当前厂区火警", 0, yellow),
    title: "Option 3",
  },
  {
    key: "4",
    icon: () => renderPic(offline, "icon-img"),
    label: renderMenuLabel("当前厂区异常", 0, orange),
    title: "Navigation One",
  },
  {
    key: "5",
    icon: () => renderPic(patrolSpot, "icon-img"),
    label: renderMenuLabel("当前厂区巡查点", 2998, blue),
    title: "Navigation Two",
  },
]);
