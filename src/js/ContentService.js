import xr from "xr";

export default class ContentService {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.docsInfoByID = null;
        this.contentTree = null;
    }

    getRelative(url) {
        return xr.get(this.baseURL + url);
    }

    getDocsInfoByID() {
        if (this.docsInfoByID) return Promise.resolve(this.docsInfoByID);
        return this.getRelative("index/docsInfoByID.json")
            .then((docsInfoByID) => {
                this.docsInfoByID = docsInfoByID;
                return docsInfoByID;
            });
    }

    async getContentTree() {
        if (!this.contentTree) {
            this.contentTree = await this.getRelative("index/contentTree.json");
        }
        return this.contentTree;
    }

    async getContentTreeFolder(folderPathElements) {
        // FIXME: handle case where folderPathElements does NOT match...
        function getSubtree(contentTree, folderPathElements) {
            return (folderPathElements.length == 0) ? contentTree : getSubtree(contentTree.folders[folderPathElements[0]], folderPathElements.slice(1));
        }
        const contentTree = await this.getContentTree();
        return getSubtree(contentTree, folderPathElements);
    }

    async getContentTreeFolderSummary(folderPathElements) {
        // FIXME: handle case where folderPathElements does NOT match...
        const docsInfoById = await this.getDocsInfoByID();
        const contentTreeFolder = await this.getContentTreeFolder(folderPathElements);
        const baseCollectionPathElems = folderPathElements.slice(1);
        return {
            name: contentTreeFolder.name,
            collectionPath: "/" + baseCollectionPathElems.join("/"),
            docsInfo: contentTreeFolder.docIds.map(docId => docsInfoById[docId]),
            folders: Object.keys(contentTreeFolder.folders).map(name => ({
                name,
                title: name,
                collectionPath: "/" + [...baseCollectionPathElems, name].join("/")
            }))
        };
    }

    /**
     * @param docId: string
     * @returns {Promise.<Document>}
     */
    getDocument(docId) {
        // TODO: consider caching (although browser will too... CORS preflight OPTIONS)
        return this.getDocsInfoByID()
            .then(docsInfoByID => docsInfoByID[docId])
            .then(docInfo => this.getRelative("content/" + docInfo.contentPath));
    }
}
