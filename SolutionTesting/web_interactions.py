from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains

# ChromeDriverManager().install()
DRIVER = webdriver.Chrome("C:\\Users\\Zac\\.wdm\\drivers\\chromedriver\\79.0.3945.36\\win32\\chromedriver.exe")
URL = "https://play.elevatorsaga.com/"
LEVEL_FORMAT = "#challenge={}"


class Page:
    def __init__(self, browser=DRIVER):
        self.level = 1

        self.speeds = [1, 2, 3, 5, 8, 13, 21, 34, 55]
        self.browser = self._browser_initialise(browser)

    @staticmethod
    def _browser_initialise(browser):
        browser.get(URL)
        return browser

    def get_down_speed_button(self):
        return self.browser.find_element_by_class_name("fa.fa-minus-square.timescale_decrease.unselectable")

    def get_up_speed_button(self):
        return self.browser.find_element_by_class_name("fa.fa-plus-square.timescale_increase.unselectable")

    def update_level(self, level):
        assert 0 < level <= 19, "Level need to be between 1 and 19."
        self.browser.get(URL + LEVEL_FORMAT.format(level))

    def get_start_pause_button(self):
        return self.browser.find_element_by_class_name("right.startstop.unselectable")

    def start(self):
        if self.get_start_pause_button().text != "Pause":
            self.get_start_pause_button().click()

    def pause(self):
        if self.get_start_pause_button().text == "Pause":
            self.get_start_pause_button().click()

    def get_speed(self):
        speed_span = self.browser.find_element_by_xpath("//h3[@class='right']/span[@class='emphasis-color']")
        return int(speed_span.text[:-1])

    def set_speed(self, speed):
        assert speed in self.speeds, "Speed not a valid speed. Valid speeds are " + str(self.speeds)
        difference = self.speeds.index(speed) - self.speeds.index(self.get_speed())
        button = self.get_up_speed_button if difference > 0 else self.get_down_speed_button
        for c in range(abs(difference)):
            button().click()
            self.browser.refresh()

    def insert_code(self, js_file):
        cm = self.browser.find_element_by_class_name('CodeMirror')

        action = ActionChains(self.browser)
        action.click(cm).perform()

        # TODO improve as currently is quite hacky
        action.send_keys("\b" * 1000).perform()
        action.click(cm).perform()
        action.send_keys("\b" * 1000).perform()

        with open(js_file, "r") as js:
            file_text = "".join(js.readlines()).replace("\"", "'")
            action.click(cm).perform()
            action.send_keys(file_text).perform()

p = Page()
p.insert_code("C:\\Users\\Zac\\Documents\\GitHub\\ElevatorSaga\\solution.js")
