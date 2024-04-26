import summaryPic from "@/assets/images/homepage/summary.png";
import unit from "@/assets/images/homepage/unit.png";
import building from "@/assets/images/homepage/building.png";
import building_fire from "@/assets/images/homepage/building_fire.png";

// 各方面概述
export interface profileType {
  icon: string;
  title: string;
  des?: string | number;
}

export const profileList: profileType[] = [
  {
    icon: unit,
    title: "社会单位消防管理",
    des: "7项问题",
  },
  {
    icon: building,
    title: "建筑消防设施",
    des: "1项问题",
  },
  {
    icon: building_fire,
    title: "建筑设计防火",
    des: "1项问题",
  },
];

// 总体
export interface totalType extends profileType {
  //   icon: string;
  //   title: string;
  //   total?: string | number;

  time1?: string;
  total1?: string | number;
  time2?: string;
  total2?: string | number;
}

export const summary: totalType = {
  icon: summaryPic,
  title: "消防安全态势 仍需努力",

  time1: "2024-03",
  total1: "0",
  time2: "2024-04-26",
  total2: "0",
};
