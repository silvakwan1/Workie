import express from "express";
import puppeteer from "puppeteer";

const app = express();
const port = 3000;

const data = async () => {
  // Lançando o navegador em modo visível
  const browser = await puppeteer.launch({ headless: true, slowMo: 50 });
  const page = await browser.newPage();

  console.log("Acessando a página...");
  await page.goto("https://www.workana.com/pt/jobs");

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
      project.titleText = titleElement ? titleElement.textContent.trim() : null;

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
      project.skills = skillsElement ? skillsElement.textContent.trim() : null;

      // Capturando a descrição HTML (div com a class "html-desc.project-details")
      const descElement = item.querySelector("div.html-desc.project-details");
      project.description = descElement ? descElement.textContent.trim() : null;

      // Adicionando os dados extraídos para o array de projetos
      projects.push(project);
    });

    return projects;
  });

  console.log("Dados extraídos:", projectData);

  // Fechando o navegador
  await browser.close();

  return projectData;
};

let dataArray = [];

// Setando o intervalo para chamar a função a cada 30 segundos
setInterval(() => {
  data().then((result) => {
    dataArray = result; // Atualiza os dados com os mais recentes
    console.log("Dados atualizados:", dataArray);
  });
}, 30000); // A cada 30 segundos

// Endpoint para retornar os dados
app.get("/", (req, res) => {
  res.json(dataArray); // Retorna os dados armazenados
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
