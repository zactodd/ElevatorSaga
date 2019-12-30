import time
from itertools import product
from SolutionTesting.web_interactions import Page
from tqdm import tqdm


def test_setup(page=Page(), level=None, speed=None, code=None):
    """
    Sets up a given a page for testing.
    :param page: The page base to be setup.
    :param level: THe level number to change too.
    :param speed: The speed to test the levels at.
    :param code: The code to test on.
    :return: The Page post setup.
    """
    if level is not None and page.level != level:
        page.update_level(level)
    if speed is not None and page.get_speed() != speed:
        page.set_speed(speed)
        time.sleep(1)
    if code is not None and (page.code is None or page.code != code):
        page.insert_code(code)
        time.sleep(1)
        page.apply()
        time.sleep(1)
    return page


def test(page, get_page_information=lambda page: page.get_statistics(), time_interval=0.5):
    """
    Tests a page.
    :param page: The page to be tested.
    :param get_page_information: The information to extract from the page base statistics by default.
    :param time_interval: The time interval to record the data at.
    :return: A dictionary of the page information at the given time intervals i.e.:
        {..., time_interval : get_page_information(page),  ... }
    """
    time.sleep(1)
    page.start()
    results = {}
    while page.level_feedback() is None:
        results[time.time()] = get_page_information(page)
        time.sleep(time_interval)
    return results


def iterative_test(page, iterations, **kwargs):
    """
    Runs several level test on a given page.
    :param page: The page to be tested.
    :param iterations: The number of tests to be run.
    :param kwargs: The kwargs relevant to the test.
    :return: A result with a tuple per iterations with if the level was successful and the related stats.
    """
    return [(test(page, **kwargs), page.level_feedback()) for i in range(iterations)]


def hyperparameter_test(page, iterations, levels, speeds, programs, **kwargs):
    """
    Hyperparameter testing.
    :param iterations: The number test per product of parameter.
    :param levels: A list of levels to be tested.
    :param speeds: A list of seeds to be tested.
    :param programs: A list of levels to be programs.
    :param kwargs: The kwargs relevant to the test.
    :return: A dictionary of the product of parameter to the results of that test.
    """
    results = {}
    for l, s, p in tqdm(product(levels, speeds, programs)):
        page = test_setup(page, l, s, p)
        results[(l, s, p)] = iterative_test(page, iterations, **kwargs)
    return results
