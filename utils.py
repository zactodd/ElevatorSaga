import sys
import os
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager


def get_chrome_driver():
    """
    Installs the chrome driver if already installed gets the drivers path.
    :return: The driver.
    """
    sys.stdout = open(os.devnull, 'w')
    try:
        path = ChromeDriverManager().install()
    except PermissionError as e:
        if e.errno != 13:
            raise e
        path = e.filename
    finally:
        sys.stdout = sys.__stdout__
    return webdriver.Chrome(path)
