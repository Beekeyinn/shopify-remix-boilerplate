export const appEmbedCheck = (blocks)=>{
    const blockId = Object.keys(blocks).find((blockId) => {
      const block = blocks[blockId];
      return (
         block.type ===
         "shopify://apps/access-pro-remix/blocks/accesspro-widget/fd52f6ef-a29f-4195-b838-3d0afcf112d2"
      );
   });
   if (blockId) {
      const block = blocks[blockId];
      if (block.disabled) {
         return false
      } else {
         return true;
      }
   }
   return false
}