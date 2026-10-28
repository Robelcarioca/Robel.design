async function testRendering() {
  const res = await fetch('http://localhost:3001/');
  const html = await res.text();

  const titles = [...html.matchAll(/aria-label="View project ([^"]+)"/g)].map(m => m[1]);
  console.log('Total project tiles rendered:', titles.length);

  const watchRolexPerfume = titles.filter(t => 
    t.toLowerCase().includes('rolex') || 
    t.toLowerCase().includes('perfume') || 
    t.toLowerCase().includes('chronograph') ||
    t.toLowerCase().includes('watch')
  );

  console.log('Matching tiles count:', watchRolexPerfume.length);
  watchRolexPerfume.forEach((t, i) => console.log(`${i + 1}. ${t}`));
}

testRendering();
