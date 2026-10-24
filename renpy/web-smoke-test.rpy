## Smoke test used by build-web.sh (copied into the build as testcases.rpy).
## It plays the opening for real: main menu, naming, the first visitor, and
## opens the stomach and character sheet. Needs Ren'Py 8.6's test runner,
## which is why it isn't in renpy/game itself.

testsuite global:
    teardown:
        exit

testcase default:
    $ _test.transition_timeout = 0.05
    click "Start"
    advance until screen "input"
    type "Tester\n"
    advance until screen "choice"

    # The first visitor's approach menu, with the panels showing.
    click "Inside"
    pause .3
    click "Close"
    click "Sheet"
    pause .3
    click "Close"

    click "Read them"
    advance until screen "choice"
    click "Lure them in"
    advance until screen "choice"
