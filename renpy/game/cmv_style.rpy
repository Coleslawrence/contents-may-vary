## Contents May Vary — characters, images and motion.
## Sizes use cpx() so the game works at any resolution the launcher
## creates (1920x1080 recommended).

## ------------------------------------------------------------ characters

## The System: bracketed, bureaucratic, and always watching.
define sy = Character(None,
    window_background=Frame("images/ui/sysbox.png", 40, 40),
    what_font="fonts/Inter-SemiBold.otf",
    what_color="#9ff3ff",
    what_outlines=[(2, "#06202a", 0, 0)],
    ctc=None)

define w = Character("Wren", color="#ff9f6b", what_font="fonts/Inter-Regular.otf")
define h = Character("Sister Hesk", color="#c9d4ff", what_font="fonts/Inter-Regular.otf")
define pell = Character("Pell", color="#a8e07a", what_font="fonts/Inter-Regular.otf")

## A flash of white for evolutions.
define evoflash = Fade(0.15, 0.0, 0.6, color="#fff6d8")


## ------------------------------------------------------------ positions
## The dialogue box covers the bottom quarter of the screen, so everyone
## stands on a line just above it.
transform mimic_home:
    xalign 0.5 ypos 0.76 yanchor 1.0

transform mimic_left:
    xalign 0.3 ypos 0.76 yanchor 1.0

transform visitor_right:
    xalign 0.74 ypos 0.74 yanchor 1.0

transform wren_side:
    xalign 0.03 ypos 0.76 yanchor 1.0 zoom 0.75

transform breathe:
    yzoom 1.0
    ease 1.7 yzoom 1.025
    ease 1.7 yzoom 1.0
    repeat

transform flinch:
    xoffset 0
    linear 0.05 xoffset 18
    linear 0.05 xoffset -14
    linear 0.05 xoffset 8
    linear 0.05 xoffset 0
    matrixcolor TintMatrix("#ff8080")
    linear 0.35 matrixcolor TintMatrix("#ffffff")


## ------------------------------------------------------------ images
init 1 python:

    def cmv_px():
        """How much to scale art drawn for a 1080-pixel-tall screen."""
        return config.screen_height / 1080.0

    for _bg in ("gutter", "bone", "road", "treasury", "vault"):
        renpy.image(("bg", _bg), Transform("images/bg/{}.jpg".format(_bg), xysize=(config.screen_width, config.screen_height)))

    def cmv_mimic_dd(st, at):
        mm = store.m
        if mm is None:
            return Transform("images/mimic/chest_closed.png", zoom=0.5 * cmv_px()), None
        return Transform(mm.sprite(), zoom=0.5 * mm.sprite_zoom() * cmv_px()), None

    def cmv_visitor_dd(st, at):
        return Transform("images/visitor/{}.png".format(store.vis_id), zoom=0.72 * cmv_px()), None

    renpy.image("mimic", DynamicDisplayable(cmv_mimic_dd))
    renpy.image("visitor", DynamicDisplayable(cmv_visitor_dd))
    renpy.image("wren", Transform("images/visitor/wren.png", zoom=0.72 * cmv_px()))
    renpy.image("hesk", Transform("images/visitor/hesk.png", zoom=0.72 * cmv_px()))


## ------------------------------------------------------------ styles for our screens
style cmv_panel is frame:
    background Frame("images/ui/panel.png", 24, 24)
    padding (cpx(14), cpx(10))

style cmv_text is text:
    font "fonts/Inter-Regular.otf"
    size cpx(17)
    color "#f2ead8"

style cmv_small is cmv_text:
    size cpx(13)
    color "#cbbfa8"

style cmv_label is cmv_text:
    font "fonts/Inter-Bold.otf"
    size cpx(19)
    color "#ffd98a"

style cmv_title is cmv_text:
    font "fonts/Inter-Bold.otf"
    size cpx(26)
    color "#ffd98a"

style cmv_button is button:
    background Frame("images/ui/button.png", 16, 16)
    hover_background Frame("images/ui/button_hover.png", 16, 16)
    selected_background Frame("images/ui/button_hover.png", 16, 16)
    insensitive_background Frame("images/ui/button_off.png", 16, 16)
    padding (cpx(12), cpx(7))

style cmv_button_text is cmv_text:
    size cpx(15)
    color "#f2ead8"
    insensitive_color "#8a8070"
    xalign 0.5
    text_align 0.5

style cmv_bar is bar:
    ysize cpx(12)
    left_bar Frame("images/ui/bar_hp.png", 6, 6)
    right_bar Frame("images/ui/bar_empty.png", 6, 6)

style cmv_bar_belly is cmv_bar:
    left_bar Frame("images/ui/bar_belly.png", 6, 6)

style cmv_bar_xp is cmv_bar:
    left_bar Frame("images/ui/bar_xp.png", 6, 6)

style cmv_bar_foe is cmv_bar:
    left_bar Frame("images/ui/bar_foe.png", 6, 6)
