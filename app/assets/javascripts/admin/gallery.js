import galleryIcon from "../../icons/gallery.svg";

class Dialog extends Cms.Dialog {
  constructor(callback) {
    super();
    const formElement = document.createElement("div");
    const titleElement = document.createElement("div");
    const columnsGroup = document.createElement("div");
    const sourcesGroup = document.createElement("div");
    const columnsLabel = document.createElement("label");
    const sourcesLabel = document.createElement("label");
    const acceptButton = document.createElement("button");

    Cms.i18n.ready.then(function() {
      titleElement.textContent = Cms.i18n.t("admin.page-editor.components.gallery");
      columnsLabel.textContent = Cms.i18n.t("admin.page-editor.properties.columns");
      sourcesLabel.textContent = Cms.i18n.t("admin.page-editor.properties.images");
      acceptButton.textContent = Cms.i18n.t("admin.confirm");
    });

    this.columnsInput = document.createElement("input");
    this.columnsInput.type = "number";
    this.sourcesInput = document.createElement("input");
    this.sourcesInput.type = "hidden";

    Cms.Style.ready.then(() => {
      titleElement.classList.add("popup-title");
      Cms.Style.apply("form", formElement);
      Cms.Style.apply("formGroup", columnsGroup, sourcesGroup);
      Cms.Style.apply("confirmButton", acceptButton);
      Cms.Style.apply("formInput", this.columnsInput);
    });

    columnsGroup.appendChild(columnsLabel);
    columnsGroup.appendChild(this.columnsInput);
    sourcesGroup.appendChild(sourcesLabel);
    sourcesGroup.appendChild(this.sourcesInput);
    formElement.appendChild(columnsGroup);
    formElement.appendChild(sourcesGroup);
    formElement.appendChild(acceptButton);
    this.popup.appendChild(titleElement);
    this.popup.appendChild(formElement);

    this.imagePicker = new Cms.inputs.MultiplePictureInput(this.sourcesInput);
    acceptButton.addEventListener("click", callback);
  }

  get columns() {
    return this.columnsInput.value;
  }

  set columns(value) {
    this.columnsInput.value = value;
  }

  get sources() {
    return this.sourcesInput.value;
  }

  set sources(value) {
    this.sourcesInput.value = value;
    this.imagePicker.reloadInputValue()
  }
}

function createGalleryItem(source) {
  const item = document.createElement("li");
  const figure = document.createElement("figure");
  const image = document.createElement("img");

  image.src = source;
  figure.appendChild(image);
  item.appendChild(figure);
  return item;
}

function collectAttributesFromElement(viewElement) {
  return {
    "columns": viewElement.getAttribute("data-columns"),
    "sources": viewElement.getAttribute("data-sources")
  }
}

function generateDatasetFromModel(modelElement) {
  return {
    "data-columns": modelElement.getAttribute("columns"),
    "data-sources": modelElement.getAttribute("sources")
  };
}

export default class Plugin extends Cms.CKEditor.Plugin {
  static toolName = "cmsGallery";

  init() {
    this.defineSchema();
    this.defineConverters();
    this.editor.ui.componentFactory.add(this.constructor.toolName, this.createButton.bind(this));
  }

  defineSchema() {
    const schema = this.editor.model.schema;
    schema.register("cmsGallery", {
      isObject: true,
      allowWhere: "$block",
      allowAttributes: ['columns', 'sources']
    });
  }

  defineConverters() {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("upcast").elementToElement({
      view: { name: "figure", classes: "blocks-gallery-grid" },
      model: (viewElement, { writer: modelWriter }) => {
        return this.createModel(viewElement, modelWriter);
      }
    });
    conversion.for("dataDowncast").elementToElement({
      model: "cmsGallery",
      view: (modelElement, { writer: viewWriter }) => {
        return this.createElement(modelElement, viewWriter);
      }
    });
    conversion.for("editingDowncast").elementToElement({
      model: "cmsGallery",
      view: (modelElement, { writer: viewWriter }) => {
        return this.createElement(modelElement, viewWriter, true);
      }
    });
  }

  createModel(viewElement, modelWriter) {
    return modelWriter.createElement(
      "cmsGallery",
      collectAttributesFromElement(viewElement)
    );
  }

  createElement(modelElement, viewWriter, inEditor = false) {
    const onClicked = this.openEditor.bind(this, modelElement);
    const attributes = generateDatasetFromModel(modelElement);
    const figure = viewWriter.createContainerElement("figure", attributes);
    const listElement = viewWriter.createRawElement("ul", {
      "class": "blocks-gallery-grid",
      "data-width": attributes["data-columns"],
      "style": inEditor ? "display:flex" : ""
    }, function (domElement) {
      JSON.parse(attributes["data-sources"]).forEach(data => {
        const source = inEditor ? data.miniature_url : data.url;
        const item = createGalleryItem(source);

        domElement.appendChild(item);
      });
      if (inEditor) {
        domElement.addEventListener("click", function() { onClicked(domElement); });
      }
    });
    viewWriter.insert(viewWriter.createPositionAt(figure, 0), listElement);
    return Cms.CKEditor.toWidget(figure, viewWriter, { label: "gallery widget" });
  }

  openEditor(modelElement, domElement) {
    const dialog = new Dialog(() => {
      const { sources, columns } = dialog;

      modelElement._setAttribute("columns", dialog.columns);
      modelElement._setAttribute("sources", dialog.sources);
      // TODO something with the dom element ? I dunno
      dialog.close();
    });
    dialog.columns = modelElement.getAttribute("columns");
    dialog.sources = modelElement.getAttribute("sources");
    dialog.open();
    window.toto = dialog;
    window.tintin = modelElement;
  }

  createButton() {
    const button = new Cms.CKEditor.ButtonView();
    button.set({ label: "admin.image-library", icon: galleryIcon });
    button.on("execute", this.buttonClicked.bind(this));
    return button;
  }

  buttonClicked() {
    const dialog = new Dialog(() => {
      const { sources, columns } = dialog;

      this.appendGallery({ sources, columns });
      dialog.close();
    });
    
    dialog.open();
  }

  appendGallery(data) {
    try {
      console.log("Append gallery with data", data);
      this.editor.model.change(writer => {
        this.editor.model.insertContent(
          writer.createElement("cmsGallery", data)
        );
      });
    } catch (err) {
      console.error("Failed", err);
    }
  }
}
