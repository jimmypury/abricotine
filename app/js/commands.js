/*
    TODO: harmoniser les commandes en .execCommand() puisque c'est le standard :
        * AbrDocument.execCommand()
        * toggle() et draw() doivent être convertis en commandes execCommand()
        * on pourra alors utiliser des commandes raccourcies du type editor.undo dans les menus
*/
module.exports = (function () {
    var remote = require('remote'),
        BrowserWindow = remote.require('browser-window'),
        app = remote.require('app'),
        shell = require('shell');
    
    return {
        new: function () {
            Abricotine.currentDocument().cmdClose();
        },
        open: function () {
            Abricotine.currentDocument().cmdOpen();
        },
        save: function () {
            Abricotine.currentDocument().cmdSave();
        },
        saveAs: function () {
            Abricotine.currentDocument().cmdSaveAs();
        },
        exportHtml: function () {
            Abricotine.currentDocument().cmdExportHtml();
        },
        quit: function () {
            BrowserWindow.getFocusedWindow().close();
        },
        undo: function () {
            Abricotine.currentDocument().editor.execCommand("undo");
        },
        redo: function () {
            Abricotine.currentDocument().editor.execCommand("redo");
        },
        copy: function () {
            document.execCommand("copy");
        },
        cut: function () {
            document.execCommand("cut");
        },
        paste: function () {
            document.execCommand("paste");
        },
        find: function () {
            Abricotine.currentDocument().editor.execCommand("clearSearch");
            Abricotine.currentDocument().editor.execCommand("find");
        },
        findNext: function () {
            Abricotine.currentDocument().editor.execCommand("findNext");
        },
        findPrev: function () {
            Abricotine.currentDocument().editor.execCommand("findPrev");
        },
        replace: function () {
            // FIXME: very bad UX in codemirror search & replace (it closes after the first replace)
            Abricotine.currentDocument().editor.execCommand("clearSearch");
            Abricotine.currentDocument().editor.execCommand("replace");
        },
        replaceAll: function () {
            Abricotine.currentDocument().editor.execCommand("clearSearch");
            Abricotine.currentDocument().editor.execCommand("replaceAll");
        },
        clearSearch: function () {
            Abricotine.currentDocument().editor.execCommand("clearSearch");
        },
        selectAll: function () {
            Abricotine.currentDocument().editor.execCommand("selectAll");
        },
        editConfigFile: function () {
            var userConfigPath = app.getPath('userData') + "/config.json";
            shell.openItem(userConfigPath);
        },
        italic: function () {
            Abricotine.currentDocument().editor.toggle("italic");
        },
        bold: function () {
            Abricotine.currentDocument().editor.toggle("bold");
        },
        ul: function () { // TODO: incohérence de nommage
            Abricotine.currentDocument().editor.toggle("unordered-list");
        },
        ol: function () { // TODO: incohérence de nommage
            Abricotine.currentDocument().editor.toggle("ordered-list");
        },
        quote: function () {
            Abricotine.currentDocument().editor.toggle("quote");
        },
        h1: function () {
            Abricotine.currentDocument().editor.toggle("h1");
        },
        h2: function () {
            Abricotine.currentDocument().editor.toggle("h2");
        },
        h3: function () {
            Abricotine.currentDocument().editor.toggle("h3");
        },
        h4: function () {
            Abricotine.currentDocument().editor.toggle("h4");
        },
        h5: function () {
            Abricotine.currentDocument().editor.toggle("h5");
        },
        h6: function () {
            Abricotine.currentDocument().editor.toggle("h6");
        },
        link: function () {
            Abricotine.currentDocument().editor.draw("link");
        },
        image: function () {
            Abricotine.currentDocument().editor.draw("image");
        },
        hr: function () {
            Abricotine.currentDocument().editor.draw("hr");
        },
        preview: function () {
            // TODO: à ranger
            var fs = require('fs');
            var dir = app.getPath('temp') + '/abricotine',
                file = 'preview-' + Date.now() + '.html', // TODO: il faudrait plutot un nom de fichier constant (et donc le timestamp est un dir)
                path = dir + '/' + file;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            Abricotine.currentDocument().cmdExportHtml(path, function () {
                shell.openExternal('file://' + path);
            });
        },
        showBlocks: function () {
            $('body').toggleClass('show-blocks');
            Abricotine.config.showBlocks = $('body').hasClass('show-blocks');
            
        },
        showHiddenCharacters: function () {
            $('body').toggleClass('show-hidden-characters');
            Abricotine.config.showHiddenCharacters = $('body').hasClass('show-hidden-characters');
        },
        autoHideMenuBar: function () {
            var focusedWindow = BrowserWindow.getFocusedWindow(),
                flag = focusedWindow.isMenuBarAutoHide();
            focusedWindow.setAutoHideMenuBar(!flag);
            Abricotine.config.autoHideMenuBar = !flag;
        },
        toggleFullscreen: function () {
            var focusedWindow = BrowserWindow.getFocusedWindow(),
                flag = focusedWindow.isFullScreen();
            focusedWindow.setFullScreen(!flag);
            focusedWindow.setMenuBarVisibility(flag);
            // TODO: ESC > exit Fullscreen
        },
        focusMode: function () {
            $('body').toggleClass('focus-mode');
        },
        devtools: function () {
            BrowserWindow.getFocusedWindow().toggleDevTools();
        },
        reload: function () {
            Abricotine.currentDocument().close();
            BrowserWindow.getFocusedWindow().reloadIgnoringCache();
        },
        openConfigDir: function () {
            var dirPath = app.getPath('userData');
            shell.openItem(dirPath);
        },
        openTempDir: function () {
            var dirPath = app.getPath('temp') + '/abricotine';
            shell.openItem(dirPath);
        },
        openAppDir: function () {
            var dirPath = __dirname;
            shell.openItem(dirPath);
        },
        execCommand: function () {
            var cm = Abricotine.currentDocument().editor.cm,
                html = "Command: <input type='text'/>",
                callback = function (query) {
                    if (!query) return;
                    Abricotine.exec(query);
                };
            cm.openDialog(html, callback);
        },
        testimg: function () {
            function replaceImg (doc, url, pos) {
                var from = pos,
                    to = {
                        line: pos.line,
                        ch: pos.ch + url.length
                    },
                    element = $('<img>').attr('src', url).get(0);
                doc.markText(from, to, {
                    replacedWith: element,
                    clearOnEnter: true,
                    handleMouseEvents: true,
                    inclusiveLeft: true,
                    inclusiveRight: true
                });
            }
            var cm = Abricotine.currentDocument().editor.cm,
                doc = cm.doc;
            doc.eachLine(function (line) {
                var getState = loadComponent('md4cm').getState,
                    lineNumber = doc.getLineNumber(line),
                    re = /[-a-zA-Z0-9@:%._\+~#=\./]+\.(jpg|jpeg|png|gif|svg)/gi,
                    str = line.text,
                    match,
                    pos;
                while ((match = re.exec(str)) !== null) {
                    pos = {
                        line: lineNumber,
                        ch: match.index
                    };
                    if (getState(cm, pos).string) {
                        replaceImg(doc, match[0], pos);
                    }
                }
            });
        },
        pane: function () {
            function getToc () {
                var cm = Abricotine.currentDocument().editor.cm,
                    doc = cm.doc,
                    toc = [];
                // TODO: une idée serait de rassembler les événements de mise à jour (preview image, toc...) dans un seul doc.eachLine et de les appeler (ou pas selon la config) quand cm.onchange. Ce serait mieux niveau perf je pense.
                doc.eachLine( function (line) {
                    var getState = loadComponent('md4cm').getState,
                        lineNumber = doc.getLineNumber(line),
                        lineContent = line.text,
                        state = getState(cm, {line: lineNumber, ch: 1});
                    if (state.header) {
                        toc.push ({
                            content: lineContent,
                            level: state.header,
                            line: lineNumber
                        });
                    }
                });
                return toc;
            }
            function getTocHtml (toc) {
                if (toc.length === 0) {
                    return;
                }
                var html = "<ul>";
                for (var i=0; i<toc.length; i++) {
                    html += '\n<li class="toc-h' + toc[i].level + '" data-abricotine-gotoline="' + toc[i].line + '">' + toc[i].content + '</li>';
                }
                html += "</ul>";
                return html;
            }
            function isPaneVisible () {
                return $('body').hasClass('pane-visible');
            }
            function setTocEvent () {
                // TODO: This is a test using a dirty Abricotine.paneEvent trick. This should be set once during app init.
                if (Abricotine.paneEvent) {
                    return;
                }
                $("#pane").on("click", "li", function () {
                    var line = parseInt($(this).attr('data-abricotine-gotoline')),
                        cm = Abricotine.currentDocument().editor.cm,
                        doc = cm.doc;
                    doc.setCursor({
                        line: line,
                        ch: null
                    })
                });
                Abricotine.paneEvent = true;
            }
            if (!isPaneVisible()) {
                var toc = getToc(),
                    html = getTocHtml(toc);
                $('#pane').html(html);
                setTocEvent();
            }
            $('body').toggleClass('pane-visible');
        }
    };
})();