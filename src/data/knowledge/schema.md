# 应作如是知识库 V1

## 目标

前端提问后，只从本项目知识库检索经典内容，再生成回答；不依赖网页搜索。

## 当前第一批经典

1. 金刚般若波罗蜜经
2. 地藏菩萨本愿经
3. 妙法莲华经
4. 大乘离文字普光明藏经
5. 大般涅槃经
6. 大方广佛华严经疏
7. 中论
8. 六祖大师法宝坛经
9. 般若波罗蜜多心经
10. 维摩诘所说经
11. 佛垂般涅槃略说教诫经
12. 大方广佛华严经
13. 法句经

## 数据流

```txt
原始文档/网页来源
  -> 清洗为经典目录 scriptures.json
  -> 精选段落写入 passages.json
  -> 生成关键词和主题
  -> 生成向量索引
  -> /api/chat 检索相关段落
  -> 模型只基于检索内容回答
```

## scriptures.json 字段

- `id`: 项目内部稳定 ID，用于引用。
- `title`: 简体中文展示名。
- `titleTraditional`: 繁体原名或通行名。
- `kind`: `sutra` 经、`commentary` 注疏、`treatise` 论。
- `priority`: 第一批处理优先级。
- `dynasty`: 朝代。
- `translatorOrAuthor`: 译者、作者或述者。
- `volumeCount`: 卷数；不确定时用 `null`。
- `topics`: 检索和问答用主题词。
- `source`: 原始资料位置。
- `status.catalog`: 目录是否已确认。
- `status.content`: 正文是否已入库。
- `status.segmentation`: 是否已拆段。
- `status.embedding`: 是否已生成向量。
- `status.qaSeeds`: 是否已有问答种子。

## 当前文件

- `passages.json`: 已校核的高频问答段落，包含经典 ID、位置、原文、白话义、主题、关键词与来源编号。
- `scriptures.json`: 经典目录与入库状态。
- `sources.json`: 解释书、讲义、用户提供文档等二级资料。

## 后续文件

- `qa-seeds.json`: 常见问题、标准回答、引用段落 ID。
- `retrieval-config.json`: 检索权重，比如标题、主题、原文、译文的权重。

## 来源分层

- `scripture`: 经典原文和译文，优先作为回答依据。
- `commentary`: 讲解、注疏、现代解释，用于帮助生成白话回答。
- `annotated-scripture`: 带译注的经典文本，需区分经典原文、译文和注释。
- `question-log`: 用户真实提问，用于补充问答种子和检索词。

回答时优先引用 `scripture`，再参考 `commentary`。如果只是解释层观点，要明确它不是经典原文。
