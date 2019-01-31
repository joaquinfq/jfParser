const jfNode  = require('jf-node');
const factory = require('jf-factory').i('nodes');
/**
 * Representa un nodo del analizador.
 *
 * @namespace jf.parser
 * @class     jf.parser.Node
 * @extends   jf.Node
 */
class jfParserNode extends jfNode
{
    /**
     * Nombre de las nodos que gestiona la clase.
     *
     * @return {string[]} Nombres de los nodos.
     */
    static get NAMES()
    {
        return [''];
    }

    /**
     * @override
     */
    constructor(config = {})
    {
        let _data;
        let _node;
        if (config)
        {
            _node = config.node;
            if (_node)
            {
                _data = _node.data;
                delete config.node;
            }
        }
        super(
            {
                data : typeof _data === 'string'
                    ? _data.split(/\n\n+/gm)
                    : []
            }
        );
        /**
         * Indica si se agregan los nodos siguientes inmediatos del tipo especificado.
         *
         * @property _addNextOf
         * @type     {string}
         *
         * @protected
         */
        this._addNextOf = '';
        /**
         * Indica si se agregan los nodos previos inmediatos del tipo especificado.
         *
         * @property _addPreviousOf
         * @type     {string}
         *
         * @protected
         */
        this._addPreviousOf = '';
        /**
         * Indica si el nodo es principal o si necesita estar asociado con otros.
         *
         * @property main
         * @type     {boolean}
         */
        this.main = true;
        /**
         * Nombre del nodo.
         *
         * @property name
         * @type     {string}
         */
        this.name = _node
            ? _node.value
            : '';
        /**
         * Listado de nodes relacionadas con el nodo actual
         * y que se buscarán para inicializar las propiedades de la clase..
         *
         * @property _nodes
         * @type     {string[]}
         *
         * @protected
         */
        this._nodes = [];
        //------------------------------------------------------------------------------
        this.setProperties(config);
        if (_node)
        {
            this._initFromToken(_node);
            this._initNodes(_node);
        }
    }

    /**
     * Inicializa la instancia a partir del nodo especificado.
     *
     * @param {jf.Node} node Nodo a usar.
     *
     * @protected
     */
    _initFromToken(node)
    {
        ['Previous', 'Next'].forEach(
            name =>
            {
                const _node = this[`_add${name}Of`];
                if (_node)
                {
                    name = name.toLowerCase();
                    this.data.push(
                        ...node.siblings(_node, name, 'value').map(
                            node =>
                            {
                                const _data = node.data;
                                node.data   = '';
                                node.value  = '';

                                return _data;
                            }
                        )
                    );
                }
            }
        );
    }

    /**
     * Inicializa la clase usando los nodos asociados.
     *
     * @param {jf.Node} current Nodo actual de la secuencia.
     *
     * @protected
     */
    _initNodes(current)
    {
        const _nodes = this._nodes;
        if (_nodes.length)
        {
            let _first = current.lookup('previous');
            _nodes.forEach(
                name =>
                {
                    const _property = name.replace(/\W+/, '');
                    let _node       = _first;
                    while (_node)
                    {
                        _node = _first.find(name, 'next', 'value');
                        if (_node)
                        {
                            const _new = factory.create(name, { node : _node });
                            if (_new)
                            {
                                if (_property in this)
                                {
                                    this[_property].push(_new);
                                }
                                else
                                {
                                    this[_property] = [_new];
                                }
                            }
                            const _next = _node.next;
                            if (_node === _first)
                            {
                                _first = _next;
                            }
                            _node.remove();
                            _node = _next;
                        }
                    }
                }
            );
        }
    }

    /**
     * @override
     */
    static register()
    {
        const _names = this.NAMES;
        if (_names && _names.length)
        {
            _names.forEach(
                name => factory.register(name, this)
            );
        }
    }

    /**
     * @override
     */
    toJSON()
    {
        const _data = super.toJSON();
        delete _data.main;

        return _data;
    }

    /**
     * Valida los valores.
     *
     * @param {array} values Listado de valores a validar.
     *
     * @return {boolean} `true` si los valores son válidos.
     *
     * @protected
     */
    _validateValues(values)
    {
        return values.every(
            value =>
            {
                let _isValid;
                if (value instanceof jfParserNode)
                {
                    _isValid = value.validate();
                }
                else if (Array.isArray(value))
                {
                    _isValid = this._validateValues(value);
                }
                else
                {
                    _isValid = true;
                }

                return _isValid;
            }
        );
    }

    /**
     * Valida los valores del nodo.
     *
     * @return {boolean} `true` si los valores son válidos.
     */
    validate()
    {
        return !!this.name && this._validateValues(
            Object.keys(this)
                .filter(property => property[0] !== '_' && property !== 'previous' && property !== 'next')
                .map(property => this[property])
        );
    }
}

module.exports = jfParserNode;
