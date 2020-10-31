var PopupController = function() {
    this.tagsInputContainer = document.getElementById('tags-input-container');
    this.tagsInput = document.getElementById('tags-input');
    this.cancelTitleButton = document.getElementById('cancel-title-button');
    this.addListeners();
};

PopupController.prototype = {

    tagsInputContainer: null,
    tagsInput: null,
    cancelTitleButton: null,
    articleTags: [],
    allTags: [],
    dirtyTags: [],
    foundTags: [],

    tabUrl: null,

    selectedTag: -1,
    selectedFoundTag: 0,


    addListeners: function() {
        this.tagsInput.addEventListener('input', this.onTagsInputChanged.bind(this));
    },

    onTagsInputChanged: function(e) {
        e.preventDefault();
        if (this.tagsInput.value !== '') {
            const lastChar = this.tagsInput.value.slice(-1);
            const value = this.tagsInput.value.slice(0, -1);
            if ((lastChar === ',') || (lastChar === ';')) {
                if (value !== '') {
                    this.addTag(this.tmpTagId, this.tagsInput.value.slice(0, -1));
                }
                this.tagsInput.value = '';
            }
        }
    },

    addTag: function(tagid, taglabel) {
        if (this.articleTags.concat(this.dirtyTags).map(t => t.label.toUpperCase()).indexOf(taglabel.toUpperCase()) === -1) {
            this.dirtyTags.push({
                id: tagid,
                label: taglabel,
                slug: taglabel
            });
            this.tagsInputContainer.insertBefore(
                this.createTagChip(tagid, taglabel),
                this.tagsInput);
            if (tagid <= 0) {
                this.tmpTagId = this.tmpTagId - 1;
            }
            this.port.postMessage({ request: 'saveTags', articleId: this.articleId, tags: this.getSaveHtml(this.getTagsStr()), tabUrl: this.tabUrl });
        } else {
            this.tagsInput.placeholder = 'Tag_already_exists';
            var self = this;
        }
        this.selectedFoundTag = 0;
        this.selectedTag = -1;
    },

    deleteChip: function(ev) {
        const chip = ev.currentTarget.parentNode;
        this.deleteTag(chip);
    },

    DeleteSelectedTag: function() {
        const chip = this.tagsInputContainer.children[this.selectedTag + 1];
        this.deleteTag(chip);
        this.selectedTag = -1;
    },
    _createContainerEl: function(id, label) {
        const container = document.createElement('div');
        container.setAttribute('class', 'chip');
        container.setAttribute('data-tagid', id);
        container.setAttribute('data-taglabel', label);
        container.appendChild(this._createTagEl(label));
        return container;
    },

    _createTagEl: (label) => {
        const tag = document.createElement('button');
        tag.setAttribute('class', 'chip-name');
        tag.textContent = label;
        return tag;
    },

    createTagChip: function(id, label) {
        const container = this._createContainerEl(id, label);

        const button = document.createElement('button');
        button.setAttribute('class', 'btn btn-clear');
        button.addEventListener('click', this.deleteChip.bind(this));

        container.appendChild(button);

        return container;
    },

    deleteTag: function(chip) {
        const tagid = chip.dataset.tagid;
        this.dirtyTags = this.dirtyTags.filter(tag => tag.id !== tagid);
        chip.parentNode.removeChild(chip);
        this.port.postMessage({ request: 'deleteArticleTag', articleId: this.articleId, tagId: tagid, tags: this.getSaveHtml(this.getTagsStr()), tabUrl: this.tabUrl });
        this.checkAutocompleteState();
        this.tagsInput.focus();
    },
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof(browser) === 'undefined' && typeof(chrome) === 'object') {
        browser = chrome;
    }
    const PC = new PopupController();
});