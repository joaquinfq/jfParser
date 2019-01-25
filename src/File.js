const fs        = require('fs');
const regexcape = require('regexcape');
/**
 * Gestiona un archivo con comentarios.
 *
 * @namespace jf.parser
 * @class     jf.parser.File
 */
module.exports = class jfParserFile
{
    /**
     * Constructor de la clase.
     *
     * @param {object} config Configuración a aplicar a la instancia.
     */
    constructor(config = {})
    {
        const _filename = (config && config.filename) || '';
        /**
         * Bloques de comentarios encontrados en el archivo.
         *
         * @type {string[]}
         */
        this.blocks = [];
        /**
         * Caracteres usados para cerrar el bloque de comentarios.
         *
         * @property close
         * @type     {string}
         */
        this.close = '*/';
        /**
         * Contenido del archivo.
         *
         * @property content
         * @type     {string}
         */
        this.content = _filename && fs.existsSync(_filename)
            ? fs.readFileSync(_filename, 'utf8')
            : _filename;
        /**
         * Caracteres usados para abrir el bloque de comentarios.
         *
         * @property open
         * @type     {string}
         */
        this.open = '/**';
        /**
         * Caracteres a eliminar al principio de cada línea del comentario.
         *
         * @property remove
         * @type     {string}
         */
        this.remove = '*';
        //------------------------------------------------------------------------------
        if (config)
        {
            Object.assign(this, config);
        }
        if (this.content)
        {
            this._buildBlocks();
        }
    }

    /**
     * Construye los bloques de comentarios a procesar extrayéndolos del código y limpiándolos.
     *
     * @protected
     */
    _buildBlocks()
    {
        const _blocks = this.content.match(
            new RegExp(
                `${regexcape(this.open)}.*?${regexcape(this.close)}`,
                'gms'
            )
        ) || [];
        if (_blocks)
        {
            this.blocks = _blocks
                .map(block => this.clean(block))
                // Omitimos aquellos textos que puedan tener los caracteres de apertura y cierre entre comillas.
                .filter(block => block[0] !== '\'' && block[0] !== '"')
            ;
        }
    }

    /**
     * Elimina los textos de apertura y cierre del bloque de comentarios así como  el carácter definido
     * en la propiedad `remove` del inicio cada línea.
     *
     * @method clean
     *
     * @param {string} block Bloque de comentarios.
     *
     * @return {string} Bloque de comentarios modificado.
     */
    clean(block)
    {
        const _remove = this.remove;
        block         = block.substring(this.open.length, block.length - this.close.length);
        if (_remove)
        {
            block = block.replace(new RegExp(`^\\s*${regexcape(_remove)}`, 'gm'), '');
        }

        return block.replace(/(^\s+|\s+$)/g, '');
    }
};
