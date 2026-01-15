
const fs = require('fs');
const path = require('path');

const foldersToDelete = [
  'src/services',
  'src/modules',
  'src/components'
];

const filesToDelete = [
  'src/types.ts',
  'src/constants.ts'
];

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`Deleted folder: ${folderPath}`);
  } else {
    console.log(`Folder not found (already clean): ${folderPath}`);
  }
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  } else {
    console.log(`File not found (already clean): ${filePath}`);
  }
};

console.log('Starting cleanup of legacy/duplicate files...');

foldersToDelete.forEach(folder => {
  deleteFolderRecursive(path.join(process.cwd(), folder));
});

filesToDelete.forEach(file => {
  deleteFile(path.join(process.cwd(), file));
});

console.log('Cleanup complete. The codebase is now using the unified structure.');
