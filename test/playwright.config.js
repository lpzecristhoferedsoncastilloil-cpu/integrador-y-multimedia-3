export const config = {
  timeout: 30000,
  browserName: "chromium",
  launchOptions: {
    headless: true,
    slowMo: 0
  },
  defaultViewport: {
    width: 1280,
    height: 720
  },
  mobileViewport: {
    width: 375,
    height: 667
  }
};
