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
];
