from channels.generic.websocket import AsyncJsonWebsocketConsumer

class StockConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("stock", self.channel_name)
        await self.accept()
    async def disconnect(self, code):
        await self.channel_layer.group_discard("stock", self.channel_name)
    async def stock_update(self, event):
        await self.send_json(event["payload"])
