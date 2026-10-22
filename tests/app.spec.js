const { test, expect } = require("@playwright/test");

// Fixtures usadas somente nos testes. As capturas usam a API real.
const shows = [{ id: 42, name: "Série de teste", image: null, genres: null }];
const episodes = [
  { id: 501, season: 2, number: 3, name: "Episódio de teste", runtime: 45 },
];
const showsURL = "https://api.tvmaze.com/shows";
const episodesURL = "https://api.tvmaze.com/shows/42/episodes";

async function mockShows(page, data = shows) {
  await page.route(showsURL, (route) => route.fulfill({ json: data }));
}

test("lista, passa o id para os episódios e permite voltar", async ({
  page,
}) => {
  await mockShows(page);
  let requestedURL;
  await page.route(episodesURL, (route) => {
    requestedURL = route.request().url();
    return route.fulfill({ json: episodes });
  });
  await page.goto("/");
  await expect(page.getByText("Série de teste", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Sem imagem para Série de teste")).toBeVisible();
  await page
    .getByRole("button", { name: "Ver episódios de Série de teste" })
    .click();
  await expect(
    page.getByText("Episódio de teste", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Temporada 2 · Episódio 3")).toBeVisible();
  expect(requestedURL).toBe(episodesURL);
  await page.getByRole("link", { name: /back/i }).click();
  await expect(page.getByText("Para explorar", { exact: true })).toBeVisible();
});

test("exibe carregamento na listagem", async ({ page }) => {
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(showsURL, async (route) => {
    await ready;
    await route.fulfill({ json: shows });
  });
  await page.goto("/");
  await expect(page.getByText("Buscando suas próximas séries…")).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
  release();
  await expect(page.getByText("Para explorar", { exact: true })).toBeVisible();
});

test("exibe carregamento no detalhe", async ({ page }) => {
  await mockShows(page);
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(episodesURL, async (route) => {
    await ready;
    await route.fulfill({ json: episodes });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ver episódios de Série de teste" })
    .click();
  await expect(page.getByText("Carregando os episódios…")).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
  release();
  await expect(
    page.getByText("Episódio de teste", { exact: true }),
  ).toBeVisible();
});

test("trata HTTP 500 na listagem e tenta novamente", async ({ page }) => {
  let attempts = 0;
  await page.route(showsURL, (route) => {
    attempts += 1;
    return route.fulfill(
      attempts === 1
        ? { status: 500, body: "Falha de teste" }
        : { json: shows },
    );
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("HTTP 500");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText("Para explorar", { exact: true })).toBeVisible();
  expect(attempts).toBe(2);
});

test("trata HTTP 503 nos episódios e tenta novamente", async ({ page }) => {
  await mockShows(page);
  let attempts = 0;
  await page.route(episodesURL, (route) => {
    attempts += 1;
    return route.fulfill(
      attempts === 1
        ? { status: 503, body: "Falha de teste" }
        : { json: episodes },
    );
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ver episódios de Série de teste" })
    .click();
  await expect(page.getByRole("alert")).toContainText("HTTP 503");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByText("Episódio de teste", { exact: true }),
  ).toBeVisible();
  expect(attempts).toBe(2);
});

test("trata falha de conexão", async ({ page }) => {
  await page.route(showsURL, (route) => route.abort("failed"));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Verifique sua conexão");
});

test("trata formato inesperado na listagem", async ({ page }) => {
  await mockShows(page, { erro: "fixture com formato inválido" });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("formato inesperado");
});

test("trata campos opcionais nulos nos episódios", async ({ page }) => {
  await mockShows(page);
  await page.route(episodesURL, (route) =>
    route.fulfill({
      json: [
        { id: 502, season: null, number: null, name: null, runtime: null },
      ],
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ver episódios de Série de teste" })
    .click();
  await expect(
    page.getByText("Episódio sem nome", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Temporada — · Episódio —")).toBeVisible();
});

test("trata listagem vazia", async ({ page }) => {
  await mockShows(page, []);
  await page.goto("/");
  await expect(page.getByText("Nenhuma série encontrada.")).toBeVisible();
});

test("trata série sem episódios", async ({ page }) => {
  await mockShows(page);
  await page.route(episodesURL, (route) => route.fulfill({ json: [] }));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ver episódios de Série de teste" })
    .click();
  await expect(
    page.getByText("Esta série ainda não possui episódios cadastrados."),
  ).toBeVisible();
});
