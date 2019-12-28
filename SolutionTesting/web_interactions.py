from selenium import webdriver

from webdriver_manager.chrome import ChromeDriverManager

DRIVER = webdriver.Chrome(ChromeDriverManager().install())


URL = "https://play.elevatorsaga.com/"
LEVEL_FORMAT = "#challenge={}"


class Page:
    def __init__(self, browser=DRIVER):
        self.level = 1

        self.speeds = [1, 2, 3, 5, 8, 13, 21, 34, 55]
        self.browser = self._browser_initialise(browser)
        self._get_controllers()

    @staticmethod
    def _browser_initialise(browser):
        browser.get(URL)
        return browser

    def _get_controllers(self):
        # Run controller
        self.start_restart_pause_button = self.browser.\
            find_element_by_class_name("right.startstop.unselectable")


    def update_level(self, level):
        assert 0 < level <= 19, "Level need to be between 1 and 19."
        self.browser.get(URL + LEVEL_FORMAT.format(level))
        self._get_controllers()

    def start(self):
        self.start_restart_pause_button.click()



p = Page()
p.start()


