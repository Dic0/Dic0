const fs = require('fs-extra');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'dist', 'github-contribution-grid-snake.svg');

async function run() {
  let data = await fs.readFile(svgPath, 'utf8');

  // Define emojis por tema
  const emojisByTheme = {
    natal: "🎄",
    halloween: "🎃",
    aniversario: "🎂",
    anoNovo: "🎉",
  };

  // Tamanho base para o quadradinho
  // Estimado pelo height do retângulo padrão no SVG (assumindo 10px)
  const baseFontSize = 10;
  const maxFontSize = baseFontSize * 1.5; // cabeça maior 1.5x
  const minFontSize = baseFontSize * 0.6; // cauda menor 0.6x

  // Função para pegar o emoji conforme a data
  function getEmojiByDate() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;

    if (month === 12 && day >= 15 && day <= 31) return emojisByTheme.natal;
    if (month === 10 && day >= 25 && day <= 31) return emojisByTheme.halloween;
    if (month === 8 && day === 20) return emojisByTheme.aniversario;
    if (month === 1 && day <= 7) return emojisByTheme.anoNovo;
    return null;
  }

  const emoji = getEmojiByDate();

  if (!emoji) {
    // Fora das datas comemorativas: só ajusta bordas e transparência
    data = data
      .replace(/fill:var\(--ce\);/g, 'fill:none;')
      .replace(/stroke-width:1px;/g, 'stroke-width:0.5px;')
      .replace(/stroke:var\(--cb\);/g, 'stroke:#ffffff;')
      .replace(/fill:var\(--c[0-4]\);/g, 'fill:none;')
      .replace(/fill:var\(--c[0-4][a-z]*\);/g, 'fill:none;')
      .replace(/{fill:var\(--c[0-4]\);/g, '{fill:none;')
      .replace(/{fill:var\(--c[0-4][a-z]*\);/g, '{fill:none;')
      .replace(/fill:var\(--ce\)/g, 'fill:none');
  } else {
    // Se for data comemorativa: troca retângulos por emojis gradativos

    // Captura todos os <rect .../> que representam a cobrinha
    const rects = [...data.matchAll(/<rect([^>]*)\/>/g)];
    const length = rects.length;

    let index = 0;
    // Para cada rect, cria uma tag <text> com emoji e tamanho gradativo
    const newSvg = data.replace(/<rect([^>]*)\/>/g, (match, attrs) => {
      // Extrair x,y,width,height
      const xMatch = attrs.match(/x="([^"]*)"/);
      const yMatch = attrs.match(/y="([^"]*)"/);
      const widthMatch = attrs.match(/width="([^"]*)"/);
      const heightMatch = attrs.match(/height="([^"]*)"/);

      if (!xMatch || !yMatch || !widthMatch || !heightMatch) return match;

      const x = parseFloat(xMatch[1]);
      const y = parseFloat(yMatch[1]);
      const width = parseFloat(widthMatch[1]);
      const height = parseFloat(heightMatch[1]);

      // Centraliza o texto no retângulo
      const textX = x + width / 2;
      const textY = y + height / 2 + height * 0.1; // leve ajuste vertical

      // Calcula font-size gradativo
      const fontSize =
        maxFontSize - ((maxFontSize - minFontSize) * index) / (length - 1);

      index++;

      return `<text x="${textX}" y="${textY}" font-size="${fontSize.toFixed(
        2
      )}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`;
    });

    data = newSvg
      .replace(/stroke-width:1px;/g, 'stroke-width:0.5px;')
      .replace(/stroke:var\(--cb\);/g, 'stroke:#ffffff;');
  }

  await fs.writeFile(svgPath, data, 'utf8');
  console.log('SVG ajustado com tema e tamanho de cobra.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
