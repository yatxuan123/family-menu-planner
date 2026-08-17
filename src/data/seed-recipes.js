const recipe = (id, name, category, meals, ingredients, minutes, difficulty = "简单") => ({
  id,
  name,
  category,
  meals,
  ingredients: ingredients.map((name) => ({ name, category: ingredientCategory(name) })),
  flavor: [],
  minutes,
  difficulty,
  steps: `准备食材，按家常做法完成${name}。`,
  notes: "",
  favorite: false,
  createdAt: "2026-08-10T00:00:00.000Z",
  updatedAt: "2026-08-10T00:00:00.000Z",
});

function ingredientCategory(name) {
  if (name === "牛奶") return "蔬菜及其他";
  if (/[鸡鸭猪牛羊肉排骨火腿]/.test(name)) return "肉蛋";
  if (/[鱼虾贝]/.test(name)) return "水产";
  if (/[米面粉燕麦馒头面包]/.test(name)) return "主食";
  if (/[盐糖油酱醋葱姜蒜]/.test(name)) return "调味料";
  return "蔬菜及其他";
}

export const SEED_DATA_VERSION = 2;

export const SEED_RECIPES = [
  recipe("r01", "小米粥", "主食", ["breakfast"], ["小米"], 30),
  recipe("r02", "鸡蛋饼", "早餐", ["breakfast"], ["鸡蛋", "面粉", "葱"], 15),
  recipe("r03", "牛奶燕麦", "早餐", ["breakfast"], ["牛奶", "燕麦"], 8),
  recipe("r04", "番茄鸡蛋面", "主食", ["breakfast", "lunch", "dinner"], ["面条", "番茄", "鸡蛋"], 20),
  recipe("r05", "蔬菜三明治", "早餐", ["breakfast"], ["面包", "生菜", "番茄", "鸡蛋"], 10),
  recipe("r06", "南瓜粥", "主食", ["breakfast"], ["南瓜", "大米"], 35),
  recipe("r07", "番茄炒蛋", "素菜", ["lunch", "dinner"], ["番茄", "鸡蛋", "葱"], 15),
  recipe("r08", "青椒肉丝", "荤菜", ["lunch", "dinner"], ["青椒", "猪肉", "姜"], 25),
  recipe("r09", "土豆烧牛肉", "荤菜", ["lunch", "dinner"], ["土豆", "牛肉", "姜"], 55, "中等"),
  recipe("r10", "清蒸鱼", "荤菜", ["lunch", "dinner"], ["鱼", "葱", "姜"], 30),
  recipe("r11", "香菇青菜", "素菜", ["lunch", "dinner"], ["香菇", "青菜", "蒜"], 15),
  recipe("r12", "蒜蓉西兰花", "素菜", ["lunch", "dinner"], ["西兰花", "蒜"], 15),
  recipe("r13", "冬瓜排骨汤", "汤", ["lunch", "dinner"], ["冬瓜", "排骨", "姜"], 60, "中等"),
  recipe("r14", "紫菜蛋花汤", "汤", ["lunch", "dinner"], ["紫菜", "鸡蛋", "葱"], 12),
  recipe("r15", "玉米胡萝卜汤", "汤", ["lunch", "dinner"], ["玉米", "胡萝卜", "排骨"], 55),
  recipe("r16", "宫保鸡丁", "荤菜", ["lunch", "dinner"], ["鸡肉", "花生", "黄瓜", "葱"], 30),
  recipe("r17", "木须肉", "荤菜", ["lunch", "dinner"], ["猪肉", "鸡蛋", "木耳", "黄瓜"], 25),
  recipe("r18", "红烧豆腐", "素菜", ["lunch", "dinner"], ["豆腐", "葱", "蒜"], 20),
  recipe("r19", "酸辣土豆丝", "素菜", ["lunch", "dinner"], ["土豆", "青椒", "醋"], 18),
  recipe("r20", "扬州炒饭", "主食", ["lunch", "dinner"], ["大米", "鸡蛋", "胡萝卜", "火腿"], 20),
  recipe("r21", "鸡丝凉面", "主食", ["lunch", "dinner"], ["面条", "鸡肉", "黄瓜"], 25),
  recipe("r22", "白菜猪肉水饺", "主食", ["lunch", "dinner"], ["面粉", "白菜", "猪肉"], 60, "中等"),
  recipe("r23", "咖喱鸡肉饭", "主食", ["lunch", "dinner"], ["大米", "鸡肉", "土豆", "胡萝卜"], 40),
  recipe("r24", "家常馄饨", "主食", ["breakfast", "lunch", "dinner"], ["馄饨皮", "猪肉", "紫菜", "葱"], 35),
  recipe("r25", "虾仁蒸蛋", "荤菜", ["lunch", "dinner"], ["虾", "鸡蛋", "葱"], 22),
  recipe("r26", "凉拌黄瓜", "素菜", ["lunch", "dinner"], ["黄瓜", "蒜", "醋"], 10),
  recipe("r27", "莲藕排骨汤", "汤", ["lunch", "dinner"], ["莲藕", "排骨", "姜"], 70, "中等"),
  recipe("r28", "肉末蒸茄子", "荤菜", ["lunch", "dinner"], ["茄子", "猪肉", "蒜"], 28),
  recipe("r29", "鱿鱼", "荤菜", ["lunch", "dinner"], ["鱿鱼", "姜", "蒜"], 25),
  recipe("r30", "红烧鱼", "荤菜", ["lunch", "dinner"], ["鱼", "姜", "蒜"], 35),
  recipe("r31", "剁椒鱼头", "荤菜", ["lunch", "dinner"], ["鱼头", "剁椒", "姜"], 40, "中等"),
  recipe("r32", "香煎带鱼", "荤菜", ["lunch", "dinner"], ["带鱼", "姜"], 30),
  recipe("r33", "芹菜酸萝卜炒毛肚", "荤菜", ["lunch", "dinner"], ["毛肚", "芹菜", "酸萝卜", "辣椒"], 25),
  recipe("r34", "红烧冬瓜", "素菜", ["lunch", "dinner"], ["冬瓜", "葱", "蒜"], 25),
  recipe("r35", "老南瓜", "素菜", ["lunch", "dinner"], ["老南瓜"], 25),
  recipe("r36", "嫩南瓜", "素菜", ["lunch", "dinner"], ["嫩南瓜", "蒜"], 15),
  recipe("r37", "煎豆腐", "素菜", ["lunch", "dinner"], ["豆腐", "葱"], 20),
  recipe("r38", "芹菜香干", "素菜", ["lunch", "dinner"], ["芹菜", "香干", "辣椒"], 15),
  recipe("r39", "紫苏黄瓜", "素菜", ["lunch", "dinner"], ["紫苏", "黄瓜", "蒜"], 15),
  recipe("r40", "煎辣椒", "素菜", ["lunch", "dinner"], ["辣椒", "蒜"], 15),
  recipe("r41", "手撕包菜", "素菜", ["lunch", "dinner"], ["包菜", "蒜"], 15),
  recipe("r42", "醋蒸鸡", "荤菜", ["lunch", "dinner"], ["鸡肉", "醋", "姜"], 45, "中等"),
  recipe("r43", "盐焗鸡", "荤菜", ["lunch", "dinner"], ["鸡肉", "盐", "姜"], 60, "中等"),
  recipe("r44", "小炒鸡", "荤菜", ["lunch", "dinner"], ["鸡肉", "辣椒", "姜"], 30),
  recipe("r45", "鸡汤", "汤", ["lunch", "dinner"], ["鸡肉", "姜"], 70, "中等"),
  recipe("r46", "蛋", "荤菜", ["lunch", "dinner"], ["鸡蛋"], 10),
  recipe("r47", "口蘑西蓝花", "素菜", ["lunch", "dinner"], ["口蘑", "西蓝花", "蒜"], 18),
  recipe("r48", "花菜", "素菜", ["lunch", "dinner"], ["花菜", "蒜"], 15),
  recipe("r49", "清炒西蓝花", "素菜", ["lunch", "dinner"], ["西蓝花", "蒜"], 15),
  recipe("r50", "黄瓜火腿肠", "荤菜", ["lunch", "dinner"], ["黄瓜", "火腿肠"], 15),
  recipe("r51", "紫苏煎黄瓜", "素菜", ["lunch", "dinner"], ["紫苏", "黄瓜", "蒜"], 18),
  recipe("r52", "擂辣椒豆角", "素菜", ["lunch", "dinner"], ["辣椒", "豆角", "蒜"], 20),
  recipe("r53", "土豆丝", "素菜", ["lunch", "dinner"], ["土豆", "辣椒"], 15),
  recipe("r54", "擂辣椒土豆片", "素菜", ["lunch", "dinner"], ["辣椒", "土豆", "蒜"], 20),
  recipe("r55", "茄子肉沫", "荤菜", ["lunch", "dinner"], ["茄子", "猪肉", "蒜"], 25),
  recipe("r56", "油豆腐肉沫", "荤菜", ["lunch", "dinner"], ["油豆腐", "猪肉", "蒜"], 25),
  recipe("r57", "姜辣鸡爪", "荤菜", ["lunch", "dinner"], ["鸡爪", "姜", "辣椒"], 50, "中等"),
  recipe("r58", "虎皮凤爪", "荤菜", ["lunch", "dinner"], ["鸡爪", "辣椒"], 60, "中等"),
  recipe("r59", "鸡翅", "荤菜", ["lunch", "dinner"], ["鸡翅", "姜"], 35),
  recipe("r60", "紫苏油爆虾", "荤菜", ["lunch", "dinner"], ["虾", "紫苏", "蒜"], 25),
  recipe("r61", "白灼虾", "荤菜", ["lunch", "dinner"], ["虾", "姜"], 15),
  recipe("r62", "小龙虾", "荤菜", ["lunch", "dinner"], ["小龙虾", "辣椒", "蒜"], 45, "中等"),
  recipe("r63", "罗氏虾", "荤菜", ["lunch", "dinner"], ["罗氏虾", "姜", "蒜"], 25),
  recipe("r64", "辣椒炒肉", "荤菜", ["lunch", "dinner"], ["辣椒", "猪肉", "蒜"], 20),
  recipe("r65", "蒜苗炒肉", "荤菜", ["lunch", "dinner"], ["蒜苗", "猪肉"], 20),
  recipe("r66", "茭白炒肉", "荤菜", ["lunch", "dinner"], ["茭白", "猪肉", "辣椒"], 20),
  recipe("r67", "胡萝卜炒肉", "荤菜", ["lunch", "dinner"], ["胡萝卜", "猪肉"], 20),
  recipe("r68", "泡椒牛肉", "荤菜", ["lunch", "dinner"], ["泡椒", "牛肉", "姜"], 25),
  recipe("r69", "土豆排骨", "荤菜", ["lunch", "dinner"], ["土豆", "排骨", "姜"], 55, "中等"),
  recipe("r70", "红烧排骨", "荤菜", ["lunch", "dinner"], ["排骨", "姜", "糖"], 55, "中等"),
  recipe("r71", "红烧猪蹄", "荤菜", ["lunch", "dinner"], ["猪蹄", "姜", "糖"], 80, "复杂"),
  recipe("r72", "红烧牛排骨", "荤菜", ["lunch", "dinner"], ["牛排骨", "姜", "糖"], 80, "复杂"),
];

export function getMissingSeedRecipes(existingRecipes = []) {
  const existingIds = new Set(existingRecipes.map((item) => item.id).filter(Boolean));
  const existingNames = new Set(existingRecipes.map((item) => item.name?.trim()).filter(Boolean));
  return SEED_RECIPES.filter((item) => !existingIds.has(item.id) && !existingNames.has(item.name));
}
