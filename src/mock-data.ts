// mock-data.ts
import { ChatMessage, ChatSession } from "./types";

// 创建一个模拟会话
export const mockSession: ChatSession = {
  id: "session-1",
  topic: "AI 技术与应用讨论",
  messages: [],
  lastUpdate: Date.now(),
};

// 创建模拟消息列表
export const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "system",
    content: "我是一个AI助手，可以帮助你解答各种问题和提供信息。",
    date: Date.now() - 3600000, // 1小时前
  },
  {
    id: "msg-2",
    role: "user",
    content: "你好！请介绍一下什么是机器学习？",
    date: Date.now() - 3500000,
  },
  {
    id: "msg-3",
    role: "assistant",
    content: "机器学习是人工智能的一个分支，它专注于开发能够从数据中学习并做出决策的算法和模型。\n\n机器学习可以分为几类主要类型：\n\n1. **监督学习**：算法从已标记的训练数据中学习，然后将所学应用到新数据上。例如分类和回归问题。\n\n2. **无监督学习**：算法从未标记的数据中发现隐藏的模式或内在结构。例如聚类和降维。\n\n3. **强化学习**：通过与环境交互来学习，通过试错来最大化某种累积奖励。\n\n机器学习在各个领域都有广泛应用，包括图像识别、自然语言处理、推荐系统等。",
    date: Date.now() - 3400000,
    model: "GPT-4",
  },
  {
    id: "msg-4",
    role: "user",
    content: "能给我展示一段代码示例吗？比如用Python实现一个简单的分类器。",
    date: Date.now() - 3300000,
  },
  {
    id: "msg-5",
    role: "assistant",
    content: "当然！下面是使用scikit-learn库实现一个简单的决策树分类器的Python代码：\n\n```python\n# 导入必要的库\nfrom sklearn import datasets\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score\n\n# 加载iris数据集\niris = datasets.load_iris()\nX = iris.data\ny = iris.target\n\n# 分割数据集为训练集和测试集\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)\n\n# 创建决策树分类器\nclf = DecisionTreeClassifier()\n\n# 训练模型\nclf.fit(X_train, y_train)\n\n# 在测试集上进行预测\ny_pred = clf.predict(X_test)\n\n# 计算准确率\naccuracy = accuracy_score(y_test, y_pred)\nprint(f'模型准确率: {accuracy:.2f}')\n```\n\n这个代码示例：\n1. 加载了经典的iris（鸢尾花）数据集\n2. 将数据分为训练集和测试集\n3. 创建并训练了一个决策树分类器\n4. 评估了模型的准确率\n\n你可以根据自己的需求修改这个例子，使用不同的模型或数据集。",
    date: Date.now() - 3200000,
    model: "GPT-4",
  },
  {
    id: "msg-6",
    role: "user",
    content: "能解释一下什么是神经网络吗？最好能有示意图。",
    date: Date.now() - 3000000,
  },
  {
    id: "msg-7",
    role: "assistant",
    content: "神经网络是一种受人脑结构启发的机器学习模型。它们由相互连接的节点（称为神经元）组成，这些神经元组织成层，用于处理和转换输入数据。\n\n神经网络的基本结构包括：\n\n1. **输入层**：接收初始数据\n2. **隐藏层**：处理输入并提取特征（可以有多层）\n3. **输出层**：产生最终结果\n\n每个神经元接收来自前一层的输入，应用权重和激活函数，然后传递输出到下一层。\n\n以下是一个简单的神经网络示意图：\n\n```mermaid\ngraph LR\n    subgraph 输入层\n        I1((I1))\n        I2((I2))\n        I3((I3))\n    end\n    subgraph 隐藏层\n        H1((H1))\n        H2((H2))\n        H3((H3))\n        H4((H4))\n    end\n    subgraph 输出层\n        O1((O1))\n        O2((O2))\n    end\n    I1 --> H1\n    I1 --> H2\n    I1 --> H3\n    I1 --> H4\n    I2 --> H1\n    I2 --> H2\n    I2 --> H3\n    I2 --> H4\n    I3 --> H1\n    I3 --> H2\n    I3 --> H3\n    I3 --> H4\n    H1 --> O1\n    H1 --> O2\n    H2 --> O1\n    H2 --> O2\n    H3 --> O1\n    H3 --> O2\n    H4 --> O1\n    H4 --> O2\n```\n\n神经网络通过一个叫做反向传播的过程进行学习，这个过程会调整神经元之间的连接权重，以最小化预测结果与实际结果之间的差异。\n\n神经网络有许多不同的类型，如卷积神经网络(CNN)用于图像处理，循环神经网络(RNN)用于序列数据，以及变换器(Transformer)用于自然语言处理。",
    date: Date.now() - 2900000,
    model: "GPT-4",
  },
  {
    id: "msg-8",
    role: "user",
    content: "这很有帮助，谢谢！另外，你能帮我用LaTeX写一个数学公式吗？比如机器学习中的损失函数。",
    date: Date.now() - 2000000,
  },
  {
    id: "msg-9",
    role: "assistant",
    content: "很高兴能帮到你！下面是一些常见机器学习损失函数的LaTeX表示：\n\n1. **均方误差损失函数 (MSE)**，用于回归问题：\n\n$$L_{MSE} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$\n\n2. **交叉熵损失函数**，用于分类问题：\n\n$$L_{CE} = -\\sum_{i=1}^{n} y_i \\log(\\hat{y}_i)$$\n\n3. **二元交叉熵损失函数**，用于二分类问题：\n\n$$L_{BCE} = -\\frac{1}{n} \\sum_{i=1}^{n} [y_i \\log(\\hat{y}_i) + (1 - y_i) \\log(1 - \\hat{y}_i)]$$\n\n4. **Hinge损失函数**，用于支持向量机：\n\n$$L_{Hinge} = \\max(0, 1 - y \\cdot \\hat{y})$$\n\n5. **Huber损失函数**，结合了MSE和MAE的优点：\n\n$$L_{Huber} = \\begin{cases}\n\\frac{1}{2}(y - \\hat{y})^2, & \\text{if } |y - \\hat{y}| \\leq \\delta \\\\\n\\delta|y - \\hat{y}| - \\frac{1}{2}\\delta^2, & \\text{otherwise}\n\\end{cases}$$\n\n其中：\n- $y_i$ 是真实值\n- $\\hat{y}_i$ 是预测值\n- $n$ 是样本数量\n- $\\delta$ 是Huber损失函数的参数\n\n这些损失函数在不同的问题和场景中有不同的应用，选择合适的损失函数对模型的性能有重要影响。",
    date: Date.now() - 1900000,
    model: "GPT-4",
  },
  {
    id: "msg-10",
    role: "user",
    content: "再给我展示一个图像处理的例子吧。",
    date: Date.now() - 1000000,
    images: ["https://example.com/sample-image.jpg"], // 模拟用户上传的图片
  },
  {
    id: "msg-11",
    role: "assistant",
    content: "这是一个使用Python和OpenCV进行基本图像处理的示例：\n\n```python\nimport cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# 读取图像\nimage = cv2.imread('image.jpg')\n\n# 转换为RGB（OpenCV默认是BGR）\nimage_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)\n\n# 灰度转换\ngray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)\n\n# 图像模糊处理\nblurred_image = cv2.GaussianBlur(image_rgb, (15, 15), 0)\n\n# 边缘检测\nedges = cv2.Canny(gray_image, 100, 200)\n\n# 创建一个包含原始图像和处理后图像的对比图\nplt.figure(figsize=(12, 10))\n\nplt.subplot(2, 2, 1)\nplt.title('原始图像')\nplt.imshow(image_rgb)\nplt.axis('off')\n\nplt.subplot(2, 2, 2)\nplt.title('灰度图像')\nplt.imshow(gray_image, cmap='gray')\nplt.axis('off')\n\nplt.subplot(2, 2, 3)\nplt.title('模糊处理')\nplt.imshow(blurred_image)\nplt.axis('off')\n\nplt.subplot(2, 2, 4)\nplt.title('边缘检测')\nplt.imshow(edges, cmap='gray')\nplt.axis('off')\n\nplt.tight_layout()\nplt.savefig('processed_images.jpg')\nplt.show()\n```\n\n这个示例展示了几种基本的图像处理操作：\n\n1. 读取图像并转换为RGB格式\n2. 将图像转换为灰度图\n3. 应用高斯模糊\n4. 使用Canny算法进行边缘检测\n5. 显示原始图像和处理后的图像进行对比\n\n在实际应用中，图像处理通常是计算机视觉任务的前处理步骤，如物体检测、人脸识别等。OpenCV是一个非常强大的图像处理库，提供了大量现成的函数和算法。\n\n如果你有特定的图像处理需求，我可以提供更针对性的代码示例。",
    date: Date.now() - 900000,
    model: "GPT-4",
  },
];

// 将模拟消息添加到模拟会话中
mockSession.messages = mockMessages;