$(document).ready(function () {
    const model = {
        data: JSON.parse(localStorage.getItem('directory')) || [],
        generateUniqueId: function () {
            return '_' + Math.random().toString(36).substr(2, 9);
        },
        saveData: function () {
            try {
                localStorage.setItem('directory', JSON.stringify(this.data));
                return { success: true, message: 'Dados salvos com sucesso.' };
            } catch (error) {
                return { success: false, message: 'Erro ao salvar os dados.' };
            }
        }
    };

    const view = {
        renderDirectory: function (items, parent) {
            items.forEach(item => {
                const listItem = $('<li class="directory-list"></li>');
                const itemCheckbox = $('<input type="checkbox">');
                const itemName = $('<span class="item-name"></span>');
                const addChildButton = $('<span class="add-child"></span>');
                const removeItemButton = $('<span class="remove-item"></span>');
                const childrenList = $('<ul class="child"></ul>');

                listItem.append(itemCheckbox);
                listItem.append(itemName);
                listItem.append(addChildButton);
                listItem.append(removeItemButton);
                listItem.append(childrenList);

                listItem.attr('data-item-id', item.itemId);
                itemCheckbox.prop('checked', item.checked);
                itemName.text(item.name);

                parent.append(listItem);

                if (item.children && item.children.length > 0) {
                    const childrenList = $('<ul class="child"></ul>');
                    listItem.append(childrenList);
                    view.renderDirectory(item.children, childrenList);
                }

                addChildButton.on('click', function () {
                    const modal = document.getElementById('addChildModal');
                    const parentItemId = $(this).closest('li').data('item-id');
                    modal.style.display = 'block';
                
                    $('#addChild').off().on('click', function () {
                        const childItemName = $('#childItemName').val();
                        controller.handleAddChild(parentItemId, childItemName, childrenList);
                
                        modal.style.display = 'none';
                        $('#childItemName').val('');
                    });
                
                    $('.close').on('click', function () {
                        modal.style.display = 'none';
                        $('#childItemName').val('');
                    });
                });                

                removeItemButton.on('click', function () {
                    const itemId = listItem.data('item-id');
                    const parentItem = controller.findParentItem(itemId, model.data);
                    if (parentItem) {
                        const index = parentItem.children.findIndex(child => child.itemId === itemId);
                        parentItem.children.splice(index, 1);
                    } else {
                        const index = model.data.findIndex(item => item.itemId === itemId);
                        if (index !== -1) {
                            model.data.splice(index, 1);
                        }
                    }
                    model.saveData();
                    listItem.remove();
                });
            });
        }
    };

    const controller = {
        init: function () {
            this.cacheDOM();
            this.bindEvents();
            view.renderDirectory(model.data, this.$itemsList);
        },
        cacheDOM: function () {
            this.$itemsList = $('#itemsList');
            this.$addItemButton = $('#addItem');
            this.$itemNameInput = $('#itemName');
        },
        bindEvents: function () {
            this.$addItemButton.on('click', this.handleAddItem.bind(this));
            this.$itemsList.on('change', 'input[type="checkbox"]', this.handleCheckboxChange.bind(this));
        },
        handleAddItem: function () {
            const itemName = this.$itemNameInput.val();
            if (itemName) {
                const itemId = model.generateUniqueId();
                const newItem = { itemId: itemId, name: itemName, children: [], checked: false };
                model.data.push(newItem);
                model.saveData();
                this.$itemNameInput.val('');
                view.renderDirectory([newItem], this.$itemsList);
            }
        },
        handleCheckboxChange: function (e) {
            const $checkbox = $(e.target);
            const itemId = $checkbox.closest('li').data('item-id');
            const item = this.findItemById(itemId, model.data);
            item.checked = $checkbox.prop('checked');
            model.saveData();
        },
        handleAddChild: function (parentItemId, childItemName, childrenList) {
            if (childItemName) {
                const itemId = model.generateUniqueId();
                const newItem = { itemId: itemId, name: childItemName, children: [], checked: false };
                const parentItem = controller.findItemById(parentItemId, model.data);
    
                if (parentItem) {
                    parentItem.children.push(newItem);
                } else {
                    model.data.push(newItem);
                }
    
                model.saveData();
                
                if (childrenList) {
                    view.renderDirectory([newItem], childrenList);
                }
            }
        },
        findItemById: function (itemId, items) {
            for (const item of items) {
                if (item.itemId === itemId) {
                    return item;
                }
                if (item.children && item.children.length > 0) {
                    const foundItem = this.findItemById(itemId, item.children);
                    if (foundItem) {
                        return foundItem;
                    }
                }
            }
            return null;
        },
        findParentItem: function (itemId, items) {
            for (const item of items) {
                if (item.children && item.children.length > 0) {
                    if (item.children.some(child => child.itemId === itemId)) {
                        return item;
                    } else {
                        const parent = this.findParentItem(itemId, item.children);
                        console.log("else: " + itemId)
                        if (parent) {
                            return parent;
                        }
                    }
                }
            }
            return null;
        },
    };

    controller.init();
});
