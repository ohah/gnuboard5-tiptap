import { ChainedCommands, Editor as Tiptap, EditorOptions } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Gapcursor from '@tiptap/extension-gapcursor'
import Dropcursor from '@tiptap/extension-dropcursor'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block';
import BulletList from '@tiptap/extension-bullet-list'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import SuperScript from '@tiptap/extension-superscript'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history';
import "remixicon/fonts/remixicon.css";
import Image from './extensions/ResizeImage'
import Iframe from "./extensions/Iframe";
import FontFamily from '@tiptap/extension-font-family'
import { CustomBlockExtension } from "./extensions/CustomCodeBlock";
import { createMarkdownEditor } from "tiptap-markdown";
import FloatingMenu from '@tiptap/extension-floating-menu'

declare global {
  interface Window {
    tiptap : Tiptap
  }
}

/**
 * @param name "color(??????)" | "justify(??????)"
 */
interface Toolbar {
  name:string | "separator" | "color" | "justify" | "video" | "link"
  tooltip?:string
  icon?:string
  button?:Element | undefined
  func?:string
  type?:"popup"
}

interface editorOptions extends Partial<EditorOptions>{
  ImageUpload? : (e:FileList) => Promise<any> | undefined
}

interface Floating {
  table? : HTMLElement,
  paragraph? : HTMLElement,
}

export default class Editor {
  private tiptap: Tiptap;
  private toolbar: HTMLElement;
  private wrapper: Element;
  private body: HTMLElement;
  private popup: HTMLElement;
  private footer: HTMLElement;
  private toolbarButton:Toolbar[];
  private option:editorOptions;
  private source:HTMLTextAreaElement;
  public floating : {
    table : HTMLElement,
    paragraph : HTMLElement
  };
  private markdownEditor:createMarkdownEditor;
  constructor(option: editorOptions) {
    this.wrapper = option.element;
    this.option = option;
    this.wrapper.classList.add('tiptap');
    this.toolbar = document.createElement("div");
    this.toolbar.className = "tiptap-toolbar";
    this.popup = document.createElement("div");
    this.popup.className = "popup";
    this.body = document.createElement("div");
    this.body.className = "tiptap-body";
    this.footer = document.createElement("div");
    this.footer.className = "tiptap-container";
    this.source = document.createElement("textarea");
    this.source.className = `tiptap-source ${option.editorProps.attributes["class"]}`;
    this.floating = {
      table : document.createElement('div'),
      paragraph : document.createElement('div')
    };
    this.floating.table.className = "floating-table";
    [
      {icon : "ri-insert-column-left", tooltip: "??? ??????(???)", func : "addColumnBefore"},
      {icon : "ri-insert-column-right", tooltip: "??? ??????(???)", func :"addColumnAfter"} ,
      {icon : "ri-insert-row-top", tooltip: "??? ??????(???)", func : "addRowBefore"},
      {icon : "ri-insert-row-bottom", tooltip: "??? ??????(??????)", func : "addRowAfter"},
      {icon : "ri-delete-column", tooltip: "??? ??????", func : "deleteColumn"},
      {icon : "ri-merge-cells-horizontal", tooltip: "??? ??????", func : "mergeCells"},
      {icon : "ri-split-cells-horizontal", tooltip: "??? ?????????", func : "splitCell"},
    ].forEach((row)=>{
      const { icon , func, tooltip } = row;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.tooltip = tooltip;
      button.innerHTML = `<i class="${icon}"></i>`;
      button.addEventListener("click", (e)=>{
        window.tiptap = this.tiptap;
        Function(`window.tiptap.chain().${func}().run()`)();
      }, false)
      this.floating.table.appendChild(button);
    });
    document.body.appendChild(this.floating.table);
    // this.source.setAttribute("style", option.editorProps.attributes["style"]);
    // this.source.style.display = "none";
    // this.body.style.display = "block";
    this.wrapper.appendChild(this.toolbar);
    this.wrapper.appendChild(this.body);
    this.body.appendChild(this.source);
    this.wrapper.appendChild(this.footer);
    /* 
    * ????????? ?????? ?????? ?????? ????????? ?????? ?????????.
    * ????????? ?????? ????????? popup-child ???????????? ??????.
    */
    let popupOver = false;
    this.wrapper.addEventListener('mouseover', (e)=>{
      if((e.target as Element).classList.contains('popup-child')){
        popupOver = true;
      } else {
        popupOver = false;
      }
    });
    document.body.addEventListener("click", (e)=>{
      if(popupOver === false) {
        this.PopupClose();
      }
    }, false);
    this.Init(option);
  }

  /**
   * 
   * @param option ????????? ?????????
   */
  private _editorInit(option: editorOptions) {
    this.tiptap = new Tiptap({
      ...option,
      extensions : [
        Document.configure({
          document : false,
        }),
        Italic,
        Strike,
        Underline,
        BulletList,
        Gapcursor,
        ListItem,
        OrderedList,
        Bold,
        CodeBlock,
        Code,
        Blockquote,
        History,
        Link,
        Iframe,
        FontFamily,
        SuperScript,
        Subscript,
        HardBreak,
        Paragraph,
        Color.configure({
          types : ['textStyle']
        }),
        TextStyle,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if(node.type.name === "p") return "????????? ???????????????";
            return "????????? ???????????????";
          }
        }),
        CustomBlockExtension,
        Text,
        Heading,
        TaskItem,
        TaskList,
        CharacterCount,
        Highlight,
        Typography,
        Table.configure({
          resizable : true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Image,
        Dropcursor,
        FloatingMenu.configure({
          element: this.floating.table,
          shouldShow: ({ editor, view, state, oldState }) => {
            console.log('ya', view, state)
            if(editor.isActive('table') === true) {
              this.floating.table.style.display = "block";
            } else {
              this.floating.table.style.display = "none";
            }
            console.log('codeblock' ,editor.isActive('codeblock'));
            // return true;
            // show the floating within any paragraph
            return editor.isActive('table')
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      element: this.body,
    });
    // this.markdownEditor = createMarkdownEditor(new Tiptap({
    //   content: "# Title",
    //   extensions : [Document, Paragraph, Heading, Text],
    // }))
  }

  /**
   * Init ?????????
   * @param option tiptap ?????? ????????? ??????
   */
  async Init(option: Partial<EditorOptions>) {
    await this._editorInit(option)
    this.toolbarButton = [
      {name : 'source', tooltip: "????????????", icon : '<i class="ri-code-s-slash-line"></i>'},
      {name : 'separator'},
      {name : 'bold', tooltip: "??????", icon: '<i class="ri-bold"></i>', func : "toggleBold" },
      {name : 'italic', tooltip : "?????????", icon: '<i class="ri-italic"></i>', func : "toggleItalic"},
      {name : 'underline', tooltip : "??????", icon: '<i class="ri-underline"></i>', func : "toggleUnderline"},
      {name : 'strike',  tooltip : "??????", icon: '<i class="ri-strikethrough"></i>', func : "toggleStrike"},
      {name : 'color',  tooltip : "??? ??????", icon: '<i class="ri-font-color"></i>', func : "setColor(e.target.value)", type : "popup"},
      {name : 'fontfamily',  tooltip : "?????? ?????????", icon: '<i class="ri-font-size-2"></i>'},
      {name : 'separator'},
      {name : 'link',  tooltip : "??????", icon: '<i class="ri-link"></i>'},
      {name : 'image',  tooltip : "?????????", icon: '<i class="ri-image-add-fill"></i>'},
      {name : 'video',  tooltip : "?????????", icon: '<i class="ri-video-add-fill"></i>'},
      {name : 'table',  tooltip : "???", icon: '<i class="ri-table-2"></i>'},
      {name : 'separator'},
      {name : 'bulletList',  tooltip : "??????", icon: '<i class="ri-list-unordered"></i>', func : "toggleBulletList"},
      {name : 'orderedList',  tooltip : "??????(??????)", icon: '<i class="ri-list-ordered"></i>', func : "toggleOrderedList"},
      {name : 'taskList',  tooltip : "??????(??????)", icon: '<i class="ri-task-line"></i>', func : "toggleTaskList"},
      {name : 'justify',  tooltip : "??????", icon: '<i class="ri-align-justify"></i>'},
      {name : 'separator'},
      {name : 'subscript',  tooltip : "????????????", icon: '<i class="ri-subscript"></i>', func : "toggleSubscript"},
      {name : 'superscript',  tooltip : "?????????", icon: '<i class="ri-superscript"></i>', func : "toggleSuperscript"},
      {name : 'separator'},
      {name : 'superscript',  tooltip : "????????????", icon: '<i class="ri-arrow-go-back-fill"></i>', func : "undo"},
      {name : 'superscript',  tooltip : "????????????", icon: '<i class="ri-arrow-go-forward-fill"></i>', func : "redo"},
      {name : 'separator'},
      {name : 'help', tooltip : '?????????', icon: '<i class="ri-question-line"></i>'}
    ]
    this.tiptap.on("selectionUpdate",({editor, transaction})=>{
      this.toolbarButton.forEach((toolbar)=>{
        if(editor.isActive(toolbar.name) === true) {
          toolbar.button.classList.add('is-active');
        }else {
          toolbar.button.classList.remove('is-active');
        }
      })
    })
    this.tiptap.on("update",({editor, transaction})=>{
      // console.log(editor, transaction);
      this.source.value = this.tiptap.getHTML();
      this.toolbarButton.forEach((toolbar)=>{
        if(editor.isActive(toolbar.name) === true) {
          toolbar.button.classList.add('is-active');
        }else {
          toolbar.button.classList.remove('is-active');
        }
      })
    })
    await this.toolbarButton.map((toolbar)=>{
      if(toolbar.name == "separator")  {
        const div = document.createElement('div');
        div.classList.add('tiptap-separator');
        toolbar.button = div;
      } else {
        toolbar.button = this.createbutton({
          name : toolbar.name,
          icon : toolbar.icon,
          func : toolbar.func,
          tooltip : toolbar.tooltip
        })
      }
      const { name, button } = toolbar;
      this.toolbar.appendChild(button);
      return toolbar;
    })
    this.wrapper.setAttribute("style", `height:${this.toolbar.getBoundingClientRect().height + this.body.getBoundingClientRect().height}px;overflow:hidden;`)
    // this.body.style.marginTop = `${this.toolbar.getBoundingClientRect().height}px`;
  }

  /**
   * ?????? ??????
   * @param name "icon"
   * @param icon "icon"
   * @param func "?????????(function)"
   * @returns element('?????????')
   */
  createbutton({name, icon, tooltip, func}:Toolbar) {
    if(name === "justify") {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = "justify-align"
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      const dropdown = document.createElement('div');
      dropdown.className = "dropdown";
      ['left', 'center', 'right', 'justify'].map((align)=>{
        const alignBtn = document.createElement('button');
        alignBtn.dataset.align = align;
        const i = document.createElement('i');
        i.className = `ri-align-${align}`;
        alignBtn.appendChild(i);
        // alignBtn.innerHTML = `<i class="ri-align-${align}"></i>`;
        alignBtn.addEventListener('click', (e)=> {
          e.preventDefault();
          e.stopPropagation();
          this.tiptap.chain().focus().setTextAlign(align).run();
        }, false);
        dropdown.appendChild(alignBtn);
      });
      button.addEventListener('click', (e)=>{
        // this.tiptap.chain().focus().setTextAlign('center').run()
      });
      button.appendChild(dropdown);
      return button;
    } else if(name === "fontfamily") {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = "font-family"
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      const dropdown = document.createElement('div');
      dropdown.className = "dropdown";
      ['Inter', 'Comic Sans MS, Comic Sans', 'serif', 'monospace', 'cursive', 'default'].map((famliy)=>{
        const fontBtn = document.createElement('button');
        fontBtn.style.fontFamily = famliy;
        fontBtn.dataset.famliy = famliy;
        fontBtn.textContent = famliy;
        fontBtn.addEventListener('click', (e)=> {
          e.preventDefault();
          e.stopPropagation();
          if(famliy === 'default') {
            this.tiptap.chain().focus().unsetFontFamily().run();
          } else {
            this.tiptap.chain().focus().setFontFamily(famliy).run();
          }
        }, false);
        dropdown.appendChild(fontBtn);
      });
      button.appendChild(dropdown);
      /** ????????? ????????? ????????????????????? ????????? ?????? ??? ???????????????. */
      window.onload = () => {
        if(button.getBoundingClientRect().left + 17 + 180 > window.innerWidth) {
          dropdown.style.right = `0px`;
          dropdown.style.left = `unset`;
        } else {
          dropdown.style.left = `0px`;
          dropdown.style.right = `unset`;
        }
        button.style.zIndex = "10001";
      }
      return button;
    } else if(name === "help") {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      const popup = document.createElement('div');
      popup.className = "popup-content help-popup";
      popup.innerHTML = [
        `<div class="popup-content popup-child">`,
          `<div class="popup-help popup-child">`,
            `<div>Made by Ohah</div>`,
            `<div>Ver 0.1</div>`,
            `<div>Use by <a href="https://github.com/ueberdosis/tiptap"> tiptap </a> </div>`,
          `</div>`,
        `</div>`
      ].join('');
      button.addEventListener("click", (e)=>{
        e.stopPropagation();
        e.preventDefault();
        this.Popup({
          parent : button,
          content : popup,
          width : 150,
        });
      }, false);
      return button;
    } else if(name === "source") {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if((this.tiptap.view.dom as HTMLElement).style.visibility !== "hidden") {
          this.source.style.visibility = "visible";
          (this.tiptap.view.dom as HTMLElement).style.visibility = "hidden";
          // console.log(this.tiptap.getJSON())
        } else {
          this.source.style.visibility = "hidden";
          (this.tiptap.view.dom as HTMLElement).style.visibility = "visible";
          // console.log(this.source.value);
        }
      }, false)
      
      return button;
    }else if(name === 'video') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
     
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        // popup.style.width = "300px";
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-tab popup-child">`,
              `<button type="button" class="popup-child" data-tab="1"><i class="ri-links-line popup-child"></i></button>`,
              `<button type="button" class="popup-child" data-tab="2"><i class="ri-code-s-slash-fill popup-child"></i></button>`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="1" style="display:block">`,
              `<input type="text" autocomplete="off" class="popup-child" name="url" placeholder="????????? URL ????????????" />`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="2" style="display:none">`,
              `<textarea placeholder="??????????????????" autocomplete="off" name="embed" class="popup-child embed-textarea"></textarea>`,
            `</div>`,
            `<div class="popup-button popup-child">`,
              `<button type="button" class="confirm popup-child"> ?????? </button>`,
            `</div>`,
          `</div>`
        ].join('');
        const tabBtn = popup.querySelectorAll('button[data-tab]');
        tabBtn.forEach((btn:HTMLElement) => {
          btn.addEventListener('click', (e)=>{
            const Idx = btn.dataset.tab;
            console.log(Idx);
            popup.querySelectorAll(`.popup-input[data-tab]`).forEach(element => {
              element.setAttribute("style", "display:none");
            });
            const tab = popup.querySelector(`.popup-input[data-tab="${Idx}"]`)
            tab.setAttribute("style", "display:block");
          }, false);
        });
        popup.querySelector('button.confirm').addEventListener("click", (e)=> {
          e.preventDefault();
          if(popup.querySelector(`.popup-input[data-tab="1"]`).getAttribute("style") === "display:block") {
            const url = (popup.querySelector('input[name=url]') as HTMLInputElement).value;
            if(!url) {
              alert('URL??? ???????????????');
              return false;
            }
            this.tiptap.chain().focus().setIframe({ src: url }).run()
            return false;
          } else {
            const text = (popup.querySelector('textarea[name=embed]') as HTMLTextAreaElement).value;
            if(!text) {
              alert('???????????? ???????????????');
              return false;
            }
            this.tiptap.chain().focus().insertContent(text).run();
          }          
        }, false)
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === 'table') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-input popup-child">`,
              `<div class="popup-child table-row-input">`,
                `<label class="popup-child"> ??? </label>`,
                `<input type="number" value="3"  min="1" autocomplete="off" class="popup-child" name="row" placeholder="???" />`,
              `</div>`,
              `<div class="popup-child table-col-input">`,
                `<label class="class="popup-child"> ??? </label>`,
                `<input type="number" value="3" min="1" autocomplete="off" class="popup-child" name="col" placeholder="???" />`,
              `</div>`,
            `</div>`,
            `<div class="popup-button popup-child">`,
              `<button type="button" class="confirm popup-child"> ?????? </button>`,
            `</div>`,
          `</div>`
        ].join('');
        popup.querySelector('.confirm').addEventListener('click', (e)=>{
          const row = (popup.querySelector(`input[name=row]`) as HTMLInputElement).value;
          const col = (popup.querySelector(`input[name=col]`) as HTMLInputElement).value;
          this.tiptap.chain().insertTable({ rows: parseInt(row), cols: parseInt(col), withHeaderRow: true }).focus().run();
          this.PopupClose();
        })
        // button.appendChild(popup);
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === "image") {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
     
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-tab popup-child">`,
              `<button type="button" class="popup-child" data-tab="1"><i class="ri-upload-fill popup-child"></i></button>`,
              `<button type="button" class="popup-child" data-tab="2"><i class="ri-links-fill popup-child"></i></button>`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="1" style="display:block">`,
              `<label for="tiptap-image-upload" class="popup-child tiptap-drag-and-drop-upload">`,
                `<input id="tiptap-image iptap-image-upload" class="popup-child" type="file" accept="image/jpeg, image/jpg, image/png, image/gif, image/webp" tabindex="-1">`,
              `</label>`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="2" style="display:none">`,
              `<input type="text" autocomplete="off" class="popup-child" name="url" placeholder="????????? URL ????????????" />`,
              `<div class="popup-button popup-child">`,
                `<button type="button" class="confirm popup-child"> ?????? </button>`,
              `</div>`,
            `</div>`,
          `</div>`
        ].join('');
        const fileInput = popup.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput.addEventListener("change", (e)=>{
          const files = (e.target as HTMLInputElement).files;
          if(files && this.option.ImageUpload) {
            this.option.ImageUpload(files).then((row)=> {
              if(row.url) {
                this.tiptap.commands.setImage({src: `${row.url}`})
              }
              // console.log('files', files);
            });
          }          
        }, false)
        const tabBtn = popup.querySelectorAll('button[data-tab]');
        tabBtn.forEach((btn:HTMLElement) => {
          btn.addEventListener('click', (e)=>{
            const Idx = btn.dataset.tab;
            popup.querySelectorAll(`.popup-input[data-tab]`).forEach(element => {
              element.setAttribute("style", "display:none");
            });
            const tab = popup.querySelector(`.popup-input[data-tab="${Idx}"]`)
            tab.setAttribute("style", "display:block");
          }, false);
        });
        popup.querySelector('button.confirm').addEventListener("click", (e)=> {
          e.preventDefault();
          if(popup.querySelector(`.popup-input[data-tab="1"]`).getAttribute("style") === "display:block") {
            const url = (popup.querySelector('input[name=url]') as HTMLInputElement).value;
            if(!url) {
              alert('URL??? ???????????????');
              return false;
            }
            this.tiptap.chain().focus().setIframe({ src: url }).run()
            return false;
          } else {
            const text = (popup.querySelector('textarea[name=embed]') as HTMLTextAreaElement).value;
            if(!text) {
              alert('???????????? ???????????????');
              return false;
            }
            this.tiptap.chain().focus().insertContent(text).run();
          }
        }, false)
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === 'link') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
     
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        // popup.style.width = "300px";
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-input popup-child">`,
              `<input type="text" autocomplete="off" class="popup-child" name="url" placeholder="URL" />`,
            `</div>`,
            `<div class="popup-input popup-child">`,
              `<input type="text" autocomplete="off" class="popup-child" name="text" placeholder="?????????" />`,
            `</div>`,
            `<div class="popup-checkbox popup-child">`,
              `<label class="popup-child">`,
                `<input type="checkbox" class="popup-child" name="target"/>`,
                `<span class="popup-child"> ??? ????????? ?????? </span>`,
              `</label>`,
            `</div>`,
            `<div class="popup-button popup-child">`,
              `<button type="button" class="popup-child"> ?????? </button>`,
            `</div>`,
          `</div>`
        ].join('');
        popup.querySelector('button').addEventListener("click", (e)=> {
          const url = (popup.querySelector('input[name=url]') as HTMLInputElement).value;
          const text = (popup.querySelector('input[name=text]') as HTMLInputElement).value;
          const target = popup.querySelector('input[name=target]:checked');
          if(!url) {
            alert('URL??? ???????????????');
            return false;
          }
          if(!text) {
            alert('???????????? ???????????????');
            return false;
          }
          this.tiptap.chain().setLink({href:url, target : target ? "_blank" : "" }).insertContent(text).run();
          this.tiptap.chain().focus();
          this.PopupClose();
          console.log(e);
        }, false)
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === 'color' && func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        e.stopPropagation();
        window.tiptap = this.tiptap;
        const colors = ['#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC', '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#F7DA64', '#FBA026', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF', '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', undefined];
        const colorElement = document.createElement('div');
        colors.map(color => {
          const span = document.createElement('span');
          span.className = "set-color popup-child";
          span.style.background = color;
          if(this.tiptap.isActive('textStyle', { color: color })) {
            span.innerHTML = `<i class="ri-check-fill selected"></i>`;
          }
          span.addEventListener("click", (e)=>{
            this.tiptap.commands.setColor(color);
            this.tiptap.chain().focus();
            this.PopupClose();
          }, false)
          colorElement.appendChild(span);
        });
        const inputWrapper = document.createElement('div');
        inputWrapper.className = "color-input-wrapper popup-child";
        inputWrapper.innerHTML = `<input type="text" value="${window.tiptap.getAttributes('textStyle').color ? window.tiptap.getAttributes('textStyle').color : ""}" /> <button type="button" class="popup-confirm popup-child">??????</button>`
        colorElement.appendChild(inputWrapper);
        inputWrapper.querySelector('button').addEventListener('click', (e)=>{
          e.stopPropagation();
          const regx = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
          if(regx.test(inputWrapper.querySelector('input').value)) {
            console.log('color', inputWrapper.querySelector('input').value);
            this.tiptap.commands.setColor(inputWrapper.querySelector('input').value);
            this.PopupClose();
          } else {
            alert('?????? ??? ????????? ????????????');
          }
        })
        this.Popup({
          parent : button,
          content : colorElement,
          width : 224,
        });
      },false);
      return button;
    } else if(func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        e.stopPropagation();
        window.tiptap = this.tiptap;
        Function(`window.tiptap.chain().${func}().run()`)();
        this.tiptap.chain().focus();
      },false);
      return button;
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      return button;
    }
    return document.createElement('button');
  }

  /**
   * ?????? ??????
   * @param parent ?????? ????????????
   * @param content ??????. Element, string
   * @param width : ?????? number
   */
  private Popup ({parent, content, width}:{parent:Element, content:Element, width:number}) {
    const { top, left, height, right} = parent.getBoundingClientRect();
    const span = document.createElement('span');
    span.classList.add("arrow");
    content.prepend(span);
    this.popup.innerHTML = '';
    if(typeof content === 'string') {
      this.popup.innerHTML = content;
    } else {
      this.popup.appendChild(content);
    }
    this.popup.style.top = `${top + height / 2}px`;
    this.popup.style.left = `${left - (width / 2) + 9}px`;
    this.popup.style.width = `${width}px`;
    this.popup.style.height = `auto`;
    this.toolbar.appendChild(this.popup);
      
    const { left : popup_left, right : popup_right } = this.popup.getBoundingClientRect();
    span.style.left = `${left - popup_left + 19}px`;
    if(width > window.innerWidth) {
      this.popup.style.width = `${window.innerWidth - 20}px`;      
    }
    if(popup_left < 0) {
      this.popup.style.left = `10px`;
    }
    if(popup_right > window.innerWidth) {
      span.style.left = "unset";
      this.popup.style.right = `${10}px`;
      span.style.right = `${10 - 15 - (right - window.innerWidth)}px`;
      this.popup.style.left = `unset`;
    }
  }

  /**
   * ?????? ?????????
   */
  private PopupClose() {
    try {
      this.toolbar.removeChild(this.popup);
    }catch(e){ 

    }
  }
}

