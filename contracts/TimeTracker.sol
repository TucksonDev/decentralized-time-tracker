// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.17;

/**
 * TimeTracker contract
 *
 * @author Tuckson
 * @title TimeTracker contract
 */
contract TimeTracker {
    //
    /////////////////////
    // State variables //
    /////////////////////
    //

    // Data Structures
    struct Session {
        uint256 startBlock;
        uint256 endBlock;
    }

    // Sessions
    mapping(address => Session[]) private _sessions;

    // Events
    event SessionStarted(address, uint256);         // User, sessionId
    event SessionEnded(address, uint256, uint256);  // User, sessionId, duration



    //
    ///////////////
    // Modifiers //
    ///////////////
    //
    /**
     * @dev Throws if `sessionId` does not exist for user `user`
     */
    modifier sessionExistsForUser(address user, uint256 sessionId) {
        require(_sessions[user].length > sessionId, "Session specified does not exist for this address");
        _;
    }

    /**
     * @dev Throws if `sessionId` has already ended
     */
    modifier sessionIsOpen(address user, uint256 sessionId) {
        require(_sessions[user][sessionId].endBlock == 0, "Session specified has already ended");
        _;
    }

    /**
     * @dev Throws if `sessionId` has not ended
     */
    modifier sessionHasEnded(address user, uint256 sessionId) {
        require(_sessions[user][sessionId].endBlock != 0, "Session specified has not ended");
        _;
    }



    //
    /////////////////
    // Constructor //
    /////////////////
    //
    constructor() {}



    //
    /////////////
    // Getters //
    /////////////
    //
    /**
     * @dev Returns true if the user has an opened session
     * @param user address to verify their sessions
     * @return bool true if the user has an opened session
     */
    function userHasOpenedSession(address user) public view returns (bool) {
        if (_sessions[user].length == 0) {
            return false;
        }

        return _sessions[user][_sessions[user].length - 1].endBlock == 0;
    }

    /**
     * @dev Returns the current opened session for the user
     * @param user address to get the session from
     * @return uint256 The current session for this user
     * 
     * Requirements:
     *
     * - `user` must have an opened session
     */
    function getCurrentSessionForUser(address user) public view returns (uint256) {
        require(userHasOpenedSession(user), "User does not have an opened session");
        return _sessions[user].length - 1;
    }

    /**
     * @dev Returns the duration in blocks of the specified session
     * @param user address to get the duration of the session from
     * @param sessionId session to get the duration of
     * @return uint256 duration in blocks of the specified session
     * 
     * Requirements:
     *
     * - `sessionId` must exist for user `user`
     * - `sessionId` must have ended for user `user`
     */
    function getSessionDuration(
        address user,
        uint256 sessionId
    ) public view sessionExistsForUser(user, sessionId) sessionHasEnded(user, sessionId) returns (uint256) {
        return _sessions[user][sessionId].endBlock - _sessions[user][sessionId].startBlock;
    }



    //
    ///////////////////////
    // Public operations //
    ///////////////////////
    //
    /**
     * @dev Starts a new session for the caller
     * @return uint256 id of the created session
     * 
     * Requirements:
     *
     * - `user` must not have an opened session
     */
    function startSession() public returns (uint256) {
        require(!userHasOpenedSession(msg.sender), "User currently has an opened session");

        _sessions[msg.sender].push(Session(block.number, 0));
        uint256 sessionId = _sessions[msg.sender].length - 1;

        emit SessionStarted(msg.sender, sessionId);
        return sessionId;
    }

    /**
     * @dev Ends the specified session for the caller
     * @param sessionId id of the session to end
     * 
     * Requirements:
     *
     * - `sessionId` must exist for the caller
     * - `sessionId` must be opene for the caller
     */
    function endSession(
        uint256 sessionId
    ) public sessionExistsForUser(msg.sender, sessionId) sessionIsOpen(msg.sender, sessionId) {
        require(_sessions[msg.sender][sessionId].endBlock == 0, "Session specified has already ended");

        _sessions[msg.sender][sessionId].endBlock = block.number;

        // Calculate duration
        uint256 sessionDuration = getSessionDuration(msg.sender, sessionId);

        // Emit event
        emit SessionEnded(msg.sender, sessionId, sessionDuration);
    }
}
