# Token Generation

Here are some tips on how to consistently generate tokens using Gemini.

## Prompt used

```text
A highly detailed, illustrated circular token for a virtual tabletop Dungeons and Dragons RPG (VTT) for, 
featuring a heavy, weathered dark stone and iron frame. This frame must perfectly match 
the texture and appearance of the borders in the provided reference image. The outside of 
the border is pure black. The perspective is a medium-close, high-angle view, looking down 
into the token. Inside the frame is a detailed digital painting: 
[CREATURE_DESCRIPTION] in [SPECIFIC_ENVIRONMENT], with [SPECIFIC_PROPS] and [LIGHTING_DESCRIPTION].
```

## How to use this Formula:

To generate the next token, you only need to fill in the bracketed variables and
use the [frame.png](./reference/frame.png) provided as reference.

For example, I just used that formula to generate a token for an aquatic
creature, specifically instructing the model not to use gold coins or lava.

**Example Applied to a New Creature (Merfolk)**:

[REF_IMAGES]: (Uses the frame.png as instructed)

[CREATURE_DESCRIPTION]: A male Merfolk warrior with deep green-blue scales, a
flowing tail, and a coral crown.

[SPECIFIC_ENVIRONMENT]: A vibrant, underwater coral reef.

[SPECIFIC_PROPS]: Colorful brain coral, sea anemones, small reef fish, and a
sea-worn treasure chest (no gold coins).

[LIGHTING_DESCRIPTION]: Soft, filtered, dappled sunlight coming from above,
creating caustic patterns.

## Post-Processing (ImageMagick)

This script processes a directory of generated token images, applies a dynamic
circular mask to remove the background, trims the excess padding, resizes the
output for virtual tabletops, and converts the files to highly compressed WebP
format.

### The Script

```bash
PADDING=60
QUALITY=85

for file in *.png *.jpg *.jpeg; do
  # Extract filename without extension
  filename=$(basename -- "$file")
  name="${filename%.*}"

  # Process image
  magick "$file" \
    \( +clone -fill black -draw "color 0,0 reset" \
       -fill white -draw "circle %[fx:w/2],%[fx:h/2] %[fx:w/2],$PADDING" \
       -alpha off \
    \) \
    -alpha off -compose CopyOpacity -composite \
    -trim +repage -resize 512x512 \
    -quality $QUALITY \
    "token_$name.webp"
done
```

### Command Breakdown

- **`PADDING=50`**: Defines the distance (in pixels) from the top edge of the
  image to the outer edge of the token's frame. This value can be adjusted if
  the generated token has a wider or narrower gap.
- **`QUALITY=85`**: Sets the WebP compression level. A value of 85 provides an
  excellent balance between file size reduction and visual fidelity
  preservation.
- **`magick "$file"`**: Invokes ImageMagick v7 on the current file in the loop.
- **`\( ... \)`**: Creates an isolated image processing stack. This temporary
  environment is used to draw a black-and-white mask without permanently
  overwriting the original image data.
  - **`+clone`**: Copies the original image into the temporary stack to ensure
    the mask uses the exact same canvas dimensions.
  - **`-fill black -draw "color 0,0 reset"`**: Floods the cloned canvas with
    pure black. In the mask, black represents absolute transparency.
  - **`-fill white -draw "circle %[fx:w/2],%[fx:h/2] %[fx:w/2],$PADDING"`**:
    Draws the solid white circle (which represents full opacity).
    - `%[fx:w/2],%[fx:h/2]`: Calculates the exact center coordinate
      `(Width/2, Height/2)`.
    - `%[fx:w/2],$PADDING`: Sets the outer edge coordinate straight up from the
      center, stopping exactly at the defined padding value from the top edge.
      ImageMagick automatically calculates the correct radius from these two
      points.
  - **`-alpha off`**: Ensures the generated mask is treated strictly as
    grayscale data, preventing any alpha-channel conflicts.
- **`-alpha off`** (outside the stack): Prepares the main original image to
  receive a new alpha channel.
- **`-compose CopyOpacity -composite`**: The core operation. It takes the
  grayscale mask built in the isolated stack and applies it directly as the
  alpha (transparency) channel of the original image.
- **`-trim +repage`**: Crops away the newly created transparent borders down to
  the exact bounding box of the token, and then resets the internal canvas
  geometry (`+repage`) so the trim is permanent.
- **`-resize 512x512`**: Scales the trimmed token down to a standard, consistent
  VTT grid size.
- **`-quality $QUALITY "token_$name.webp"`**: Applies the compression variable
  and saves the final optimized output.
