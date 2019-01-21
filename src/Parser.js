const jfFactory   = require('jf-factory');
const jfTokenizer = require('ff-tokenizer/src/Tokenizer');
const tokens      = jfFactory.i('tokens');
/**
 * Clase básica para construir un analizador semántico.
 *
 * @namespace jf.parser
 * @class     jf.parser.Parser
 */
module.exports = class jfParserParser extends jfTokenizer
{
    /**
     * Crea el node a usar por defecto.
     *
     * @return {jf.Node} Token por defecto.
     *
     * @protected
     */
    _createDefaultNode()
    {
        return tokens.create('', '');
    }

    /**
     * Analiza el listado de tokens almacenados en el tokenizador y los convierte
     * en otro tipo de nodo.
     */
    parse(tokenizer)
    {
        let _last  = this._createDefaultNode();
        let _first = _last;
        for (const _token of tokenizer)
        {
            _last = this._parseToken(_token, _last);
        }
        _first = this._removeTokens(_first);
        if (!this.first)
        {
            this.first = _first;
        }
        this.last = _last;

        return _first;
    }

    /**
     * Analiza el nodo y lo convierte a otro tipo de nodo.
     * Las clases hijas deberían verificar el tipo de nodo actual y decidir cuál
     * es el nuevo nodo a generar.
     *
     * @param {jf.Node} current Nodo actual siendo analizado.
     * @param {jf.Node} last    Último nodo analizado.
     *
     * @return {jf.Node} Nodo a usar como último nodo.
     *
     * @protected
     */
    _parseToken(current, last)
    {
        const _node = new this._createDefaultNode();
        Object.keys(current).forEach(
            property =>
            {
                if (property !== '_' && property in _node)
                {
                    _node[property] = current[property];
                }
            }
        );

        return _node;
    }

    /**
     * Elimina los nodos vacíos.
     *
     * Las clases hijas pueden reimplementar este método para minimizar la lista de nodos.
     *
     * @param {jf.Node} first Primer nodo encontrado.
     *
     * @return {jf.Node} first Nodo a usar como primero de la lista.
     *                         Si se elimina el primer nodo, se debe devolver otro como primero.
     *
     * @protected
     */
    _removeTokens(first)
    {
        return first;
    }

    /**
     * @override
     */
    toString()
    {
        const _first = this.first;

        return _first
            ? JSON.stringify(_first.toArray(), null, 4)
            : '';
    }
};
