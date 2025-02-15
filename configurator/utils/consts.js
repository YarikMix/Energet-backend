const consts = {
    Common_Sources: ["solar", "wind", "TEG"],
    Common_DSources: ["DGS", "FC"],
    Common_Storages: ["AB", "SC"],
    AVAILABLE_SOURCES: ["Солнечные батареи", "Ветрогенераторы", "Термоэлектрические генераторы"],
    AVAILABLE_DSOURCES: ["Дизельный генератор", "Топливный элемент"],
    AVAILABLE_STORAGES: ["Аккумуляторные батареи", "Суперконденсаторы"],
    OPTIMISATION_TARGETS: ["Надежность энергоснабжения", "Минимальная стоимость", "Максимальная выгода", "Надежность энергоснабжения (минимизация LCOE)"],
    OPTIMISATION_LOAD: ["Постоянное потребление", "Зимнее и летнее потребление"],
}

module.exports = consts