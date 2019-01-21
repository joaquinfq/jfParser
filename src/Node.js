const jfNode  = require('jf-node');
const factory = require('jf-factory').i('nodes');
/**
 * Representa un nodo del analizador.
 *
 * @namespace jf.parser
 * @class     jf.parser.Node
 * @extends   jf.Node
 */
module.exports = class jfParserNode extends jfNode
{
    /**
     * Nombre de las nodos que gestiona la clase.
     *
     * @return {string[]}
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
        const _node = config && config.node;
        delete config.node;
        super(_node && _node.data.split(/\n\n+/gm));
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
        this.name = _node.value;
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
        Object.assign(this, config);
        if (_node)
        {
            this._initFromToken(_node);
            this._initNodes(_node);
        }
    }

    /**
     * Realiza un volcado por pantalla del nodo para inspeccionaarlo.
     */
    dump()
    {
        console.log(JSON.stringify(this, null, 4));
    }

    /**
     * Encuentra el valor especificado en una secuencia de nodos permitiendo
     * ir hacia adelante o hacia atrás.
     *
     * @param {jf.Node} node     Nodo inicial.
     * @param {string}  value    Valor a buscar.
     * @param {string}  iterate  Propiedad del nodo sobre la que se iterará.
     * @param {string}  property Propiedad que tiene el valor a buscar.
     *
     * @return {jf.Node|null} Nodo con el valor o `null` si no se encontró.
     */
    find(node, value, iterate = 'next', property = 'data')
    {
        while (node && node[property] !== value)
        {
            node = node[iterate];
        }

        return node;
    }

    /**
     * Encuentra el primer nodo de una secuencia.
     *
     * @param {jf.Node} node Nodo de la secuencia.
     *
     * @return {jf.Node} Primer nodo de la secuencia.
     */
    findFirst(node)
    {
        while (node)
        {
            if (node.previous)
            {
                node = node.previous
            }
            else
            {
                break;
            }
        }

        return node;
    }

    /**
     * Encuentra el valor especificado avanzando hacia adelante en una secuencia de nodos.
     *
     * @param {jf.Node} node  Token inicial.
     * @param {string}  value Texto a buscar.
     *
     * @return {jf.Node|null} Nodo con el valor o `null` si no se encontró.
     */
    findNext(node, value)
    {
        return this.find(node, value, 'next');
    }

    /**
     * Encuentra el valor especificado avanzando hacia atrás en una secuencia de nodos.
     *
     * @param {jf.Node} node  Nodo inicial.
     * @param {string}  value Valor a buscar.
     *
     * @return {jf.Node|null} Nodo con el valor o `null` si no se encontró.
     */
    findPrevious(node, value)
    {
        return this.find(node, value, 'previuous');
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
                        ...this.siblings(node[name], _node, name).map(
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
            const _first = this.findFirst(current);
            _nodes.forEach(
                name =>
                {
                    const _property = name.replace(/\W+/, '');
                    let _node       = _first;
                    while (_node)
                    {
                        _node = this.findNext(_node, name);
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
        if (_names)
        {
            _names.forEach(
                name => factory.register(name, this)
            );
        }
    }

    /**
     * Busca todos los nodos inmediatos con el valor especificado.
     *
     * @param {jf.Node} node     Nodo inicial.
     * @param {string}  value    Valor a buscar.
     * @param {string}  iterate  Propiedad del nodo sobre la que se iterará.
     * @param {string}  property Propiedad que tiene el valor a buscar.
     *
     * @return {jf.Node[]} Listado de nodos encontrados.
     */
    siblings(node, value, iterate = 'next', property = 'data')
    {
        const _nodes = [];
        while (node && node[property] === value)
        {
            if (node.data)
            {
                _nodes[property === 'next' ? 'push' : 'unshift'](node);
            }
            node = node[property];
        }
        return _nodes;
    }

    /**
     * @override
     */
    toJSON()
    {
        const _data = {};
        Object.keys(this).sort().forEach(
            property =>
            {
                if (property[0] !== '_')
                {
                    _data[property] = this[property];
                }
            }
        );
        [ 'main', 'next', 'previous'].forEach(
            property => delete _data[property]
        );

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
                if (value instanceof TagBase)
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
        return !!this.tag && this._validateValues(
            Object.keys(this)
                .filter(property => property[0] !== '_' && property !== 'previous' && property !== 'next')
                .map(property => this[property])
        );
    }
};
