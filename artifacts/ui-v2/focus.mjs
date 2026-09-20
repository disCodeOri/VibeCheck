import sharp from 'sharp';
await sharp('artifacts/ui-v2/story-comparison.png').extract({left:0,top:240,width:800,height:510}).png().toFile('artifacts/ui-v2/ticket-detail-comparison.png');
