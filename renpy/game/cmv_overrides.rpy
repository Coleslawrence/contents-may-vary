## Contents May Vary — small adjustments to the standard Ren'Py look.
## These run after the launcher's gui.rpy and screens.rpy, so they only nudge
## a few properties instead of replacing those files.

init offset = 10

## Keep menu choices in a column across the top, between the "you" panel on
## the left and the visitor and dice panels on the right, so they never hide
## the mimic or the visitor standing below.
style choice_vbox:
    xalign 0.5
    ypos cpx(12)
    yanchor 0.0
    spacing cpx(5)

style choice_button:
    xsize cpx(700)

style choice_button_text:
    font "fonts/Inter-Regular.otf"
    size cpx(19)

## Narration and dialogue in the same clean typeface as the panels.
style say_dialogue:
    font "fonts/Inter-Regular.otf"

style say_label:
    font "fonts/Inter-Bold.otf"

style input:
    font "fonts/Inter-Regular.otf"
