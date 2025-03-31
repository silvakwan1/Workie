// api/index.js
import puppeteer from "puppeteer";

export default async function handler(req, res) {
  try {
    // Lançando o navegador em modo visível
    const browser = await puppeteer.launch({ headless: true }); // Para Vercel, headless: true é preferível
    const page = await browser.newPage();

    console.log("Acessando a página...");
    await page.goto("https://www.workana.com/jobs?language=pt");

    // Espera a página carregar completamente
    console.log("Aguardando os projetos...");
    await page.waitForSelector("div.project-item.js-project");

    // Adicionando a classe 'project-item-featured' nas divs
    await page.evaluate(() => {
      const projectItems = document.querySelectorAll(
        "div.project-item.js-project"
      );
      projectItems.forEach((item) => {
        item.classList.add("project-item-featured");
      });
    });

    console.log("Class 'project-item-featured' adicionada às divs.");

    // Extraindo os dados de cada projeto
    const projectData = await page.evaluate(() => {
      const projects = [];

      const projectItems = document.querySelectorAll(
        "div.project-item.js-project"
      );
      projectItems.forEach((item) => {
        const project = {};

        // Capturando o texto da data
        const dateElement = item.querySelector("h5.date.visible-xs");
        project.date = dateElement ? dateElement.textContent.trim() : null;

        // Capturando o título e o link do projeto
        const titleElement = item.querySelector("h2.h3.project-title span a");
        project.titleLink = titleElement ? titleElement.href : null;
        project.titleText = titleElement
          ? titleElement.textContent.trim()
          : null;

        // Capturando o texto da data de publicação (span com a class "date")
        const publishedDateElement = item.querySelector("span.date");
        project.publishedDate = publishedDateElement
          ? publishedDateElement.textContent.trim()
          : null;

        // Capturando o número de propostas (span com a class "bids")
        const bidsElement = item.querySelector("span.bids");
        project.bids = bidsElement ? bidsElement.textContent.trim() : null;

        // Capturando as habilidades (div com a class "skills")
        const skillsElement = item.querySelector("div.skills");
        project.skills = skillsElement
          ? skillsElement.textContent.trim()
          : null;

        // Capturando a descrição HTML (div com a class "html-desc.project-details")
        const descElement = item.querySelector("div.html-desc.project-details");
        project.description = descElement
          ? descElement.textContent.trim()
          : null;

        // Adicionando os dados extraídos para o array de projetos
        projects.push(project);
      });

      return projects;
    });

    console.log("Dados extraídos:", projectData);

    await browser.close();

    // Retorna os dados extraídos como resposta da API
    res.status(200).json(projectData);
  } catch (error) {
    console.error("Erro ao executar o script:", error);
    res.status(500).json({ error: "Erro ao executar o script." });
  }
}
