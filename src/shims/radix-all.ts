import * as React from 'react';

// Generic primitive wrappers to stand in for Radix UI components during development.
// These simple components forward props and render basic HTML elements so UI files
// that import Radix primitives can compile and run without installing the full Radix package set.

function make(name: string, Tag: any = 'div') {
  const Comp = React.forwardRef(function Comp(props: any, ref: any) {
    const { children, ...rest } = props;
    return React.createElement(Tag, { ref, 'data-radix': name, ...rest }, children);
  });
  Comp.displayName = `Radix.${name}`;
  return Comp;
}

// Export a broad set of primitives commonly used across Radix packages.
export const Root = make('Root');
export const Slot = make('Slot', 'span');
export const Trigger = make('Trigger', 'button');
export const Content = make('Content');
export const Item = make('Item');
export const Label = make('Label');
export const Group = make('Group');
export const Checkbox = make('Checkbox', 'input');
export const Radio = make('Radio', 'input');
export const Progress = make('Progress');
export const Slider = make('Slider');
export const Switch = make('Switch', 'button');
export const Tabs = make('Tabs');
export const TabList = make('TabList');
export const TabTrigger = make('TabTrigger', 'button');
export const TabContent = make('TabContent');
export const Portal = make('Portal');
export const Viewport = make('Viewport');
export const Dialog = make('Dialog');
export const DialogTrigger = make('DialogTrigger', 'button');
export const DialogContent = make('DialogContent');
export const DialogOverlay = make('DialogOverlay');
export const Select = make('Select');
export const SelectTrigger = make('SelectTrigger', 'button');
export const SelectContent = make('SelectContent');
export const SelectItem = make('SelectItem');
export const Separator = make('Separator', 'hr');
export const Popover = make('Popover');
export const PopoverTrigger = make('PopoverTrigger', 'button');
export const PopoverContent = make('PopoverContent');
export const ToastProvider = make('ToastProvider');
export const ToastRoot = make('ToastRoot');
export const ToastViewport = make('ToastViewport');
export const Tooltip = make('Tooltip');
export const TooltipTrigger = make('TooltipTrigger', 'span');
export const TooltipContent = make('TooltipContent');
export const Toggle = make('Toggle', 'button');
export const ToggleGroup = make('ToggleGroup');
export const SeparatorPrimitive = Separator;
export const Accordion = make('Accordion');
export const AccordionItem = make('AccordionItem');
export const AccordionTrigger = make('AccordionTrigger', 'button');
export const AccordionContent = make('AccordionContent');
export const Menu = make('Menu');
export const MenuItem = make('MenuItem');
export const Avatar = make('Avatar');
export const HoverCard = make('HoverCard');
export const NavigationMenu = make('NavigationMenu');
export const NavigationMenuItem = make('NavigationMenuItem');
export const ScrollArea = make('ScrollArea');
export const RadioGroup = make('RadioGroup');
export const RadioGroupItem = make('RadioGroupItem', 'input');
export const SliderPrimitive = Slider;
export const SwitchPrimitives = Switch;

// Provide a default export in case some imports expect it
export default {
  Root,
  Trigger,
  Content,
  Item,
  Label,
  Group,
  Checkbox,
  Radio,
  Progress,
  Slider,
  Switch,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Portal,
  Viewport,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Separator,
  Popover,
  PopoverTrigger,
  PopoverContent,
  ToastProvider,
  ToastRoot,
  ToastViewport,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Toggle,
  ToggleGroup,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Menu,
  MenuItem,
  Avatar,
  HoverCard,
  NavigationMenu,
  NavigationMenuItem,
  ScrollArea,
  RadioGroup,
  RadioGroupItem,
};
