const fileInput = document.getElementById("file");
const documentElement = document.getElementById("document");
const statusElement = document.getElementById("status");

const paperSelect = document.getElementById("paper");
const marginInput = document.getElementById("margin");

const btnPdf = document.getElementById("btnPdf");
const btnClear = document.getElementById("btnClear");


/*
 * Carrega o arquivo Markdown.
 */
fileInput.addEventListener("change", async function () {

  const file = this.files[0];

  if (!file) {
    return;
  }

  try {

    statusElement.textContent =
      `Lendo arquivo: ${file.name}`;

    const markdown = await file.text();

    /*
     * Converte Markdown para HTML.
     */
    const html = marked.parse(markdown);

    documentElement.innerHTML = html;

    statusElement.textContent =
      `Arquivo carregado: ${file.name}`;

  } catch (error) {

    console.error(error);

    statusElement.textContent =
      "Erro ao ler o arquivo.";

  }

});


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

  statusElement.textContent =
    "Nenhum arquivo carregado.";

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

  /*
   * Verifica se existe conteúdo.
   */
  if (
    !documentElement.innerText.trim() ||
    documentElement.querySelector(".empty")
  ) {

    alert(
      "Carregue um arquivo Markdown antes de gerar o PDF."
    );

    return;
  }


  const margin =
    Number(marginInput.value) || 20;

  const paper =
    getPaperSize();


  /*
   * Nome do arquivo.
   */
  const originalFile =
    fileInput.files[0];

  let filename = "documento";

  if (originalFile) {

    filename =
      originalFile.name
        .replace(/\.(md|markdown)$/i, "");

  }


  /*
   * Configurações do html2pdf.
   */
  const options = {

    margin: margin / 3.78,

    filename:
      `${filename}.pdf`,

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

      orientation: "portrait"
    },

    pagebreak: {

      mode: [
        "avoid-all",
        "css",
        "legacy"
      ]
    }
  };


  statusElement.textContent =
    "Gerando PDF...";


  try {

    await html2pdf()
      .set(options)
      .from(documentElement)
      .save();

    statusElement.textContent =
      "PDF gerado com sucesso.";

  } catch (error) {

    console.error(error);

    statusElement.textContent =
      "Erro ao gerar o PDF.";

    alert(
      "Não foi possível gerar o PDF."
    );
  }

});