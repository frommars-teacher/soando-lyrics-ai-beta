export async function preparePhoto(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('JPG, PNG 또는 WebP 사진을 선택해 주세요. HEIC 사진은 JPG로 바꿔 주세요.');
 if(file.size>10*1024*1024)throw new Error('사진은 10MB 이하로 선택해 주세요.');
 let image;try{image=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw new Error('사진 파일을 읽지 못했어요. 다른 사진을 선택해 주세요.');}
 try{
  if(!image.width||!image.height||image.width*image.height>40000000)throw new Error('사진 해상도가 너무 커요. 조금 작게 찍어 주세요.');
  const scale=Math.min(1,1600/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('이 브라우저에서 사진을 처리하지 못했어요. 직접 입력해 주세요.');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));
  if(blob?.size>1500000)blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.65));
  if(!blob||blob.size>1500000)throw new Error('사진을 줄이지 못했어요. 가사 부분만 가까이 찍어 주세요.');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('사진을 읽지 못했어요. 다시 선택해 주세요.'));reader.readAsDataURL(blob);});
  return data;
 }finally{image.close();}
}
