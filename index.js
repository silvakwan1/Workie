import { chromium } from "playwright";

async function getPlaywrightData() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.workana.com/jobs?language=pt");

  const projectData = await page.evaluate(() => {
    const projects = [];

    const projectItems = document.querySelectorAll(
      "div.project-item.js-project"
    );
    projectItems.forEach((item) => {
      const project = {};
      const dateElement = item.querySelector("h5.date.visible-xs");
      project.date = dateElement ? dateElement.textContent.trim() : null;

      const titleElement = item.querySelector("h2.h3.project-title span a");
      project.titleLink = titleElement ? titleElement.href : null;
      project.titleText = titleElement ? titleElement.textContent.trim() : null;

      const publishedDateElement = item.querySelector("span.date");
      project.publishedDate = publishedDateElement
        ? publishedDateElement.textContent.trim()
        : null;

      const bidsElement = item.querySelector("span.bids");
      project.bids = bidsElement ? bidsElement.textContent.trim() : null;

      const skillsElement = item.querySelector("div.skills");
      project.skills = skillsElement ? skillsElement.textContent.trim() : null;

      const descElement = item.querySelector("div.html-desc.project-details");
      project.description = descElement ? descElement.textContent.trim() : null;

      projects.push(project);
    });

    return projects;
  });

  console.log(projectData);
  await browser.close();
}

getPlaywrightData();
