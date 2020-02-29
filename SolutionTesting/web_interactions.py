from utils import get_chrome_driver
from selenium.common.exceptions import NoSuchElementException

DRIVER = get_chrome_driver()
URL = "https://play.elevatorsaga.com/"


class Page:
    def __init__(self, browser=DRIVER):
        self.level = 1
        self.speeds = [1, 2, 3, 5, 8, 13, 21, 34, 55]
        self.browser = self._browser_initialise(browser)
        self.code = None

    @staticmethod
    def _browser_initialise(browser):
        """
        Initialise the browser.
        :param browser: The browser prior to being initialise.
        :return: The browser.
        """
        browser.get(URL)
        return browser

    def get_down_speed_button(self):
        """
        Gets the down speed button from the web page.
        :return: The button element representing decrementing speed.
        """
        return self.browser.find_element_by_class_name("fa.fa-minus-square.timescale_decrease.unselectable")

    def get_up_speed_button(self):
        """
        Gets the up seed button from the web page.
        :return: The button element representing incrementing speed.
        """
        return self.browser.find_element_by_class_name("fa.fa-plus-square.timescale_increase.unselectable")

    def update_level(self, level):
        """
        Changes to the url a specifics levels url.
        :param level: An integer [1, 19] (19 being a sandbox) representing the level..
        """
        assert 0 < level <= 19, "Level need to be between 1 and 19."
        self.browser.get(URL + f"#challenge={level}")
        self.level = level

    def get_start_pause_button(self):
        """
        Gets the start/restart/pause button from the web page.
        :return: The button element representing start/restart/pause.
        """
        return self.browser.find_element_by_class_name("right.startstop.unselectable")

    def get_apply_button(self):
        """
        Gets the apply button from the web page.
        :return: The button element representing apply.
        """
        return self.browser.find_element_by_id("button_apply")

    def start(self):
        """
        If the level is not running or pause start it.
        """
        if self.get_start_pause_button().text == "Start":
            self.get_start_pause_button().click()
        elif self.get_start_pause_button().text == "Restart":
            self.browser.refresh()
            self.get_start_pause_button().click()

    def pause(self):
        """
        If the level is running pause it.
        """
        if self.get_start_pause_button().text == "Pause":
            self.get_start_pause_button().click()

    def get_speed(self):
        """
        Get the current speed the level is running.
        :return: An integer representing that speed.
        """
        speed_span = self.browser.find_element_by_xpath("//h3[@class='right']/span[@class='emphasis-color']")
        return int(speed_span.text[:-1])

    def set_speed(self, speed):
        """
        Set the speed for the level to running.
        :param speed: An integer representing the speed to run.
        """
        assert speed in self.speeds, "Speed not a valid speed. Valid speeds are " + str(self.speeds)
        difference = self.speeds.index(speed) - self.speeds.index(self.get_speed())
        button = self.get_up_speed_button if difference > 0 else self.get_down_speed_button
        for c in range(abs(difference)):
            button().click()
            self.browser.refresh()

    def insert_code(self, js_file):
        """
        Inserts code into the code pane.
        :param js_file: The js file to be inserted into the code pane.
        """
        code_mirror_set_js = "document.querySelector('.CodeMirror').CodeMirror.setValue(\"{}\");"

        with open(js_file, "r") as js:
            code = "".join(js.readlines()).replace("\n", "\\n")
        self.browser.execute_script(code_mirror_set_js.format(code))
        self.code = js_file

    def apply(self, dont_run=True):
        """
        Applies coding changes and starts/restarts a test.
        :param dont_run: A flag communicating if apply should and run as the page does when pressing the button.
        """
        self.get_apply_button().click()
        if dont_run:
            self.browser.refresh()

    def get_statistics(self):
        """
        Get the statistics from the web page.
        :return: A dictionary of the statistic name and its value.
        """
        state_container = self.browser.find_element_by_class_name("statscontainer")
        keys = state_container.find_elements_by_class_name("key")
        values = state_container.find_elements_by_css_selector("span[class^='value']")
        return {k.text: v.text for k, v in zip(keys, values)}

    def level_feedback(self):
        """
        Gets the feedback from the level.
        :return: returns the values of the feedback if it exists otherwise none.
        """
        try:
            feedback = self.browser.\
                find_element_by_xpath("//div[@class='feedback']/h2[@class='emphasis-color']").text
        except Exception as e:
            if type(e) != NoSuchElementException:
                raise e
            feedback = None
        return feedback


