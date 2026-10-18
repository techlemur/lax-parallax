# Lax

A React component for parallax.

## Example

```js
import Lax from "lax-parallax";

<Lax y="{80}" x="{20}"> Content here </Lax>
```

## Attributes

| Property         | Default | Description                                          |
| ---------------- | ------- | ---------------------------------------------------- |
| id               | random  | Standard component id attribute                      |
| className        | ""      | Standard component class name attribute              |
| x                | 0       | How far to move along the x axis in pixels           |
| y                | 0       | How far to move along the y axis in pixels           |
| clamp            | 0       | Limit the transition to a smaller part of the screen |
| scale            | 1       | How much to scale the element                        |
| blur             | 0       | How much blur to add in pixels                       |
| opacity          | 100     | Minimum level of opacity. (0-100)                    |
| sepia            | 0       | Sepia level (0-1)                                    |
| offset           | 0       | Moves the middle of the transition up or down        |
| deadzone         | 0       | Treat a larger portion of the screen as centered     |
| opacityDeadzone  | 0       | deadzone for only opacity (overridden by deadzone )  |
| blurDeadzone     | 0       | deadzone for only blur (overridden by deadzone )     |
| transition       | 0       | CSS transition time in seconds                       |
| initial          | false   | Treat initial position as animation center           |
| transitionCenter | false   | Coming soon...                                       |
| debug            | false   | Activates debug mode                                 |

### Caveats

- A window re-size will break most effects. A page refresh is usually
  required to re-calculate the effect scroll positions.
