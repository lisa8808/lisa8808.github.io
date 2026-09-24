(function () {
  const STATUS_AUTHOR = { high: "高风险", medium: "中风险", missing: "缺失" };

  function makeComment(D, id, card) {
    return {
      id,
      author: STATUS_AUTHOR[card.item.status] || "提示",
      date: new Date(),
      children: [
        new D.Paragraph({ children: [new D.TextRun({ text: card.finding.title || "审查发现", bold: true })] }),
        new D.Paragraph({ children: [new D.TextRun("风险说明：" + (card.finding.analysis || ""))] }),
        new D.Paragraph({ children: [new D.TextRun("修订建议：" + (card.finding.suggestion || ""))] })
      ]
    };
  }

  async function buildAnnotatedBlob(options) {
    const D = window.docx;
    if (!D) throw new Error("docx 组件未加载");
    const title = options.title || "审查报告";
    const reportItems = options.reportItems || [];
    const bidDoc = options.bidDoc || [];
    const ignored = options.ignored || new Set();

    const comments = [];
    const commentByMark = new Map();
    const missingCards = [];
    let nextId = 1;

    reportItems.filter(item => !ignored.has(item.title)).forEach(item => {
      (item.findings || []).forEach(finding => {
        const card = { item, finding };
        if (finding.bidMark && !commentByMark.has(finding.bidMark)) {
          commentByMark.set(finding.bidMark, nextId);
          comments.push(makeComment(D, nextId, card));
          nextId += 1;
        } else {
          missingCards.push(card);
        }
      });
    });

    const body = [];
    body.push(new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [new D.TextRun({ text: title + "（批注文件）", bold: true, size: 32 })]
    }));

    bidDoc.forEach(block => {
      if (block.heading) {
        const isChapter = /^第.+章/.test(block.heading);
        body.push(new D.Paragraph({
          heading: isChapter ? D.HeadingLevel.HEADING_1 : D.HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new D.TextRun({ text: block.heading, bold: true, size: isChapter ? 28 : 24 })]
        }));
        return;
      }
      if (block.text) {
        body.push(new D.Paragraph({ spacing: { after: 120 }, children: [new D.TextRun(block.text)] }));
        return;
      }
      if (block.segments) {
        const runs = [];
        block.segments.forEach(segment => {
          const text = segment[0];
          const mark = segment[1];
          if (mark && commentByMark.has(mark)) {
            const id = commentByMark.get(mark);
            runs.push(new D.CommentRangeStart(id));
            runs.push(new D.TextRun(text));
            runs.push(new D.CommentRangeEnd(id));
            runs.push(new D.CommentReference(id));
          } else {
            runs.push(new D.TextRun(text));
          }
        });
        body.push(new D.Paragraph({ spacing: { after: 120 }, children: runs }));
      }
    });

    if (missingCards.length > 0) {
      body.push(new D.Paragraph({
        heading: D.HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        children: [new D.TextRun({ text: "缺失项提示", bold: true, size: 28 })]
      }));
      body.push(new D.Paragraph({
        spacing: { after: 120 },
        children: [new D.TextRun("以下内容未在当前投标文件中检测到，请对照批注补充完善；补充后可删除本节及对应批注。")]
      }));
      missingCards.forEach(card => {
        const id = nextId;
        comments.push(makeComment(D, id, card));
        nextId += 1;
        body.push(new D.Paragraph({
          spacing: { after: 120 },
          children: [
            new D.CommentRangeStart(id),
            new D.TextRun("• " + (card.finding.title || "待补充内容")),
            new D.CommentRangeEnd(id),
            new D.CommentReference(id)
          ]
        }));
      });
    }

    const doc = new D.Document({
      creator: "华鲲元启 智能投标",
      title,
      styles: {
        default: {
          document: {
            run: { font: { ascii: "Times New Roman", eastAsia: "宋体", hAnsi: "Times New Roman" }, size: 21 }
          }
        }
      },
      comments: { children: comments },
      sections: [{ children: body }]
    });
    return D.Packer.toBlob(doc);
  }

  async function downloadAnnotatedDocx(fileName, options) {
    const blob = await buildAnnotatedBlob(options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName + ".docx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.Review2Docx = { buildAnnotatedBlob, downloadAnnotatedDocx };
})();
