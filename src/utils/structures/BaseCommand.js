module.exports = class BaseCommand {
    constructor(name, description, category, options, timeout) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.options = options;
        this.timeout = timeout;
    }
};
