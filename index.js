const promise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
};

async function main() {
  console.log(1);
  const value = await promise();
  console.log(value);
  console.log(3);
}

main();
/* 
1
2
3
*/
