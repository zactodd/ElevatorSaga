from time import sleep
from SolutionTesting.web_interactions import Page


def test_setup(page=Page(), level=None, speed=None, code=None):
    """
    Sets up a given a page for testing.
    :param page: The page base to be setup.
    :param level: THe level number to change too.
    :param speed: The speed to test the levels at.
    :param code: The code to test on.
    :return: The Page post setup.
    """
    if level is not None:
        page.update_level(level)
    if speed is not None:
        page.set_speed(speed)
        sleep(3)
    if code is not None:
        page.insert_code(code)
        page.apply()
    return page
