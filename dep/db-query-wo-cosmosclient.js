  // async function list() {

  //   const query = `
  //       {
  //         people {
  //           items {
  //             id
  //             Name
  //           }
  //         }
  //       }`;
        
  //   const endpoint = '/data-api/graphql';
  //   const response = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ query: query })
  //   });
  //   try {
  //     const result = await response.json();
  //     console.table(result.data.people.items);
  //   }
  //   catch (error) {
  //     console.error('Error list()'+error);
  //   }
  // }
