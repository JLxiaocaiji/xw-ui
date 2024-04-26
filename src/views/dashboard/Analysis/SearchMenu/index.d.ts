import { FunctionalComponent, VNode, RendererNode, RendererElement } from "vue";

export interface MenuItemType {
  key?: string;
  icon: FunctionalComponent;
  label: string;
  title: string;
}

export type RenderFn = (imgUrl: string) => VNode<
  RendererNode,
  RendererElement,
  {
    [key: string]: any;
  }
>;
