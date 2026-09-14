const fileInput = document.getElementById("file");
const documentElement = document.getElementById("document");
const statusElement = document.getElementById("status");

const paperSelect = document.getElementById("paper");
const orientationSelect = document.getElementById("orientation");
const marginInput = document.getElementById("margin");

const btnPdf = document.getElementById("btnPdf");
const btnClear = document.getElementById("btnClear");


/*
 * Atualiza a pré-visualização conforme tamanho, orientação e margem.
 */
function updatePreviewPage() {
  const paper = getPaperSize();
  const orientation = orientationSelect.value;
  const margin = Math.max(0, Number(marginInput.value) || 0);

  const sizes = {
    a4: { width: "210mm", height: "297mm" },
    letter: { width: "215.9mm", height: "279.4mm" },
    a5: { width: "148mm", height: "210mm" }
  };

  const size = sizes[paper];

  documentElement.style.width =
    orientation === "landscape" ? size.height : size.width;

  documentElement.style.minHeight =
    orientation === "landscape" ? size.width : size.height;

  documentElement.style.padding = `${margin}mm`;
}


/*
 * Carrega o arquivo Markdown.
 */
fileInput.addEventListener("change", async function () {
  const file = this.files[0];

  if (!file) {
    return;
  }

  try {
    statusElement.textContent = `Lendo arquivo: ${file.name}`;

    const markdown = await file.text();
    const html = marked.parse(markdown);

    documentElement.innerHTML = html;
    updatePreviewPage();

    statusElement.textContent = `Arquivo carregado: ${file.name}`;
  } catch (error) {
    console.error(error);
    statusElement.textContent = "Erro ao ler o arquivo.";
  }
});


/*
 * Atualiza a pré-visualização ao alterar as configurações.
 */
paperSelect.addEventListener("change", updatePreviewPage);
orientationSelect.addEventListener("change", updatePreviewPage);
marginInput.addEventListener("input", updatePreviewPage);
marginInput.addEventListener("change", updatePreviewPage);


/*
 * Limpar documento.
 */
btnClear.addEventListener("click", function () {
  fileInput.value = "";

  documentElement.innerHTML = `
    <div class="empty">
      <h2>Markdown → PDF</h2>
      <p>
        Selecione um arquivo Markdown para visualizar
        o documento.
      </p>
    </div>
  `;

  updatePreviewPage();

  statusElement.textContent = "Nenhum arquivo carregado.";
});


/*
 * Obtém dimensões da página.
 */
function getPaperSize() {
  const paper = paperSelect.value;

  switch (paper) {
    case "a5":
      return "a5";

    case "letter":
      return "letter";

    default:
      return "a4";
  }
}


/*
 * Geração do PDF.
 */
btnPdf.addEventListener("click", async function () {
  if (
    !documentElement.innerText.trim() ||
    documentElement.querySelector(".empty")
  ) {
    alert("Carregue um arquivo Markdown antes de gerar o PDF.");
    return;
  }

  const margin = Math.max(0, Number(marginInput.value) || 0);
  const paper = getPaperSize();
  const orientation = orientationSelect.value;

  const originalFile = fileInput.files[0];

  let filename = "documento";

  if (originalFile) {
    filename = originalFile.name.replace(/\.(md|markdown)$/i, "");
  }

  const options = {
    margin: margin / 3.78,

    filename: `${filename}.pdf`,

    image: {
      type: "jpeg",
      quality: 0.98
    },

    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false
    },

    jsPDF: {
      unit: "mm",
      format: paper,
      orientation: orientation
    },

    pagebreak: {
      mode: [
        "avoid-all",
        "css",
        "legacy"
      ]
    }
  };

  statusElement.textContent = "Gerando PDF...";

  try {
    await html2pdf()
      .set(options)
      .from(documentElement)
      .save();

    statusElement.textContent = "PDF gerado com sucesso.";
  } catch (error) {
    console.error(error);

    statusElement.textContent = "Erro ao gerar o PDF.";

    alert("Não foi possível gerar o PDF.");
  }
});


/*
 * Inicializa a pré-visualização.
 */
updatePreviewPage();