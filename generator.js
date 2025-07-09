const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');

const folderQR = './kody_qr';
const outputPDF = './output/naklejki.pdf';

const stronaSzer = 595.28;
const stronaWys = 841.89;

//tutaj możesz zmienić rozmiar jednej naklejki
const naklejkaSzer = 100;
const naklejkaWys = 100;

const margines = 20;

const podpis = 'Twoje Logo lub Tekst'; //tutaj możesz ustawić podpis, który pojawi się pod każdym QR

const kolumny = Math.floor((stronaSzer - 2 * margines) / naklejkaSzer);
const wiersze = Math.floor((stronaWys - 2 * margines) / naklejkaWys);

const doc = new PDFDocument({ size: 'A4' });
doc.pipe(fs.createWriteStream(outputPDF));

const plikiQR = fs.readdirSync(folderQR).filter(nazwa => /\.(png|jpe?g)$/i.test(nazwa));

(async () => {
  let licznik = 0;

  for (const plik of plikiQR) {
    const kol = licznik % kolumny;
    const wiersz = Math.floor(licznik / kolumny) % wiersze;

    if (licznik > 0 && licznik % (kolumny * wiersze) === 0) {
      doc.addPage();
    }

    const x = margines + kol * naklejkaSzer;
    const y = margines + wiersz * naklejkaWys;

    const sciezka = path.join(folderQR, plik);
    const temp = `./temp_${plik}`;

    await sharp(sciezka)
      .resize(naklejkaSzer, naklejkaWys - 20)
      .toFile(temp);

    doc.image(temp, x, y);

    doc.fontSize(8).text(podpis, x, y + naklejkaWys - 10, {
      width: naklejkaSzer,
      align: 'center'
    });

    fs.unlinkSync(temp);

    licznik++;
  }

  doc.end();
  console.log('Gotowe');
})();
