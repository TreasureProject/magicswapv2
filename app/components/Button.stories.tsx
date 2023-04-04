import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button } from "../primitives/Button";

export default {
  component: Button,
} as ComponentMeta<typeof Button>;

export const Primary: ComponentStory<typeof Button> = () => (
  <Button mode="primary">Button</Button>
);
