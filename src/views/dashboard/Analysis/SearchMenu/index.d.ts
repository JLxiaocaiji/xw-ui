import { FunctionalComponent, VNode, RendererNode, RendererElement } from "vue";

export interface MenuItemType {
  key?: string;
  icon: FunctionalComponent;
  label: VNode;
  title: string;
}

export type RenderFn = (
  imgUrl?: string,
  num?: string | number,
  //   styles?: string[],
  pic?: string
) => VNode<
  RendererNode,
  RendererElement,
  {
    [key: string]: any;
  }
>;
