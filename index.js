import puppeteer from "puppeteer-core";
import { join } from "path";

let dataArray = [];

const getBrowser = async () => {
  // Puppeteer com o Chromium da Vercel
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH, // Vercel fornece o caminho correto para o Chromium
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return browser;
};

const fetchData = async () => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.goto("https://www.workana.com/pt/jobs");

  await page.waitForSelector("div.project-item.js-project");

  await page.evaluate(() => {
    const projectItems = document.querySelectorAll(
      "div.project-item.js-project"
    );
    projectItems.forEach((item) => {
      item.classList.add("project-item-featured");
    });
  });

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

  await browser.close();
  return projectData;
};

// Função para atualizar os dados a cada 5 segundos
const updateDataPeriodically = () => {
  setInterval(async () => {
    try {
      console.log("Buscando dados...");
      const data = await fetchData();
      dataArray = data; // Atualiza os dados
      console.log("Dados atualizados:", dataArray);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }, 5000); // Intervalo de 5 segundos
};

// Atualiza os dados quando a função for chamada (uma vez)
updateDataPeriodically();

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(dataArray); // Retorna os dados mais recentes
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
