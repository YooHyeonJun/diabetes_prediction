# ml_core/model.py
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, input_dim, hidden1=128, hidden2=64, num_classes=2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden1),
            nn.ReLU(),
            nn.Linear(hidden1, hidden2),
            nn.ReLU(),
            nn.Linear(hidden2, num_classes),
        )

    def forward(self, x):
        return self.net(x)
